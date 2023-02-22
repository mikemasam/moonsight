import logger from './logger.js';

export default function CreateAppQueue(ctx){
  ctx.queue = new AppQueue(ctx);
  return ctx;
}
const QUEUE_TIMEOUT = 10;
class AppQueue {
  constructor(ctx) {
    this.ctx = ctx;
    this.ctx.events.on("kernel.ready", () => this.attachEvents());
  }
  async attachEvents(){
    logger.byType('queue',`Queue started`);
    await this.ctx.net.RedisClientSubscriber.subscribe('deba.core.kernel.exlusive.queue', (message) => {
      logger.byType('queue',`new message`, message);
      this._queueLockReleased();
    });
  }
  async aquire(name, _opts){
    const opts = { wait: true };
    if(_opts === true) opts.wait = true;
    else if(_opts === false) opts.wait = false;
    else if(_opts?.wait === false) opts.wait = false;
    if(!Array.isArray(this.ctx.opts.settings['kernel.exlusive.queue'])) 
    this.ctx.opts.settings['kernel.exlusive.queue'] = [];
    return new Promise(async (resolve) => {
      const lockId = Math.random() + "";
      const startTime = Date.now();
      const aquired = await this._queueAquireLock(name, lockId);
      if(aquired){
        resolve({
          lockId,
          startTime,
          clear: async () => this._queueReleaseLock(name, lockId, startTime),
          keepAlive: async () => this.keepAlive(name),
        });
      }else{
        if(opts.wait){
          this.ctx.opts.settings[`kernel.exlusive.queue`].push({ lockId, resolve, name });
        }else{
          resolve(false);
        }
      }
    });
  }
  async _queueLockReleased(){
    if(!Array.isArray(this.ctx.opts.settings['kernel.exlusive.queue'])) 
    this.ctx.opts.settings['kernel.exlusive.queue'] = [];
    const task = this.ctx.opts.settings[`kernel.exlusive.queue`][0];
    if(task){
      const aquired = await this._queueAquireLock(task.name, task.lockId);
      if(aquired){
        this.ctx.opts.settings[`kernel.exlusive.queue`].splice(0, 1)
        task.resolve({
          lockId: task.lockId,
          clear: async () => this._queueReleaseLock(task.name, task.lockId, task.startTime),
          keepAlive: async () => this.keepAlive(name),
        });
      }
    }
  }
  async keepAlive(name){
    const qex = await this.ctx.net.RedisClient.expire(name, QUEUE_TIMEOUT).catch(err => false);
    console.assert(qex, "[KernelJs] ~ queue failed to set expire, set to expire");
  }
  async _queueAquireLock(name, lockId){
    if(!this.ctx.ready) {
      logger.byType('queue',`App not ready`);
      return false;
    }
    const result = await this.ctx.net.RedisClient.setNX(name, lockId).catch(err => { 
      logger.byType('queue',`an error occured`, err);
      return false;
    });
    logger.byType('queue',`aquiring lock ${name} => `, result, lockId);
    if(result){
      const qex = await this.ctx.net.RedisClient.expire(name, QUEUE_TIMEOUT).catch(err => false);
      console.assert(qex, "[KernelJs] ~ queue failed to set expire");
      logger.byType('queue',`lock aquired`, name, lockId);
      this.ctx.state.count++;
      return true;
    }
    const ttl = await this.ctx.net.RedisClient.ttl(name).catch(err => false);
    if(!ttl || ttl < 0){
      await this.keepAlive(name)
      return false;
    }
  }
  async _queueReleaseLock(name, lockId, startTime){
    this.ctx.state.count--;
    if(!Array.isArray(this.ctx.opts.settings['kernel.exlusive.queue'])) this.ctx.opts.settings['kernel.exlusive.queue'] = [];
    const result = await this.ctx.net.RedisClient.get(name).catch(err => false);
    const endTime = Date.now();
    if(result == null || result === false) return endTime - startTime;
    if(result != lockId) {
      logger.byType('queue',`queue lost lock`);
    }else{
      const qdl = await this.ctx.net.RedisClient.del(name).catch(err => false);
      console.assert(qdl, "[KernelJs] ~ queue failed to release lock");
    }
    logger.byType('queue',`queue released`, name, lockId);
    await this.ctx.net.RedisClient.publish('deba.core.kernel.exlusive.queue', JSON.stringify({ lockId, name }));
    return endTime - startTime;
  }
}
