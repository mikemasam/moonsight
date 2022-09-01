

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
      if(this.ctx.opts.logging.queue)
    console.log("queue events added");
    const subscriber = this.ctx.net.RedisClient.duplicate();
    await subscriber.connect();
    await subscriber.subscribe('deba.core.kernel.exlusive.queue', (message) => {
      if(this.ctx.opts.logging.queue)
      console.log(message); // 'message'
      this._queueLockReleased();
    });
  }
  async aquire(name, _opts){
    const opts = { wait: true };
    if(_opts === true) opts.wait = true;
    else if(_opts === false) opts.wait = false;
    if(!Array.isArray(this.ctx.opts.settings['kernel.exlusive.queue'])) this.ctx.opts.settings['kernel.exlusive.queue'] = [];
    return new Promise(async (resolve) => {
      const lockId = Math.random() + "";
      const aquired = await this._queueAquireLock(name, lockId);
      if(aquired){
        resolve({
          lockId,
          clear: async () => this._queueReleaseLock(name, lockId),
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
    const task = this.ctx.opts.settings[`kernel.exlusive.queue`][0];
    if(task){
      const aquired = await this._queueAquireLock(task.name, task.lockId);
      if(aquired){
        this.ctx.opts.settings[`kernel.exlusive.queue`].splice(0, 1)
        task.resolve({
          lockId: task.lockId,
          clear: async () => this._queueReleaseLock(task.name, task.lockId),
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
    const result = await this.ctx.net.RedisClient.setNX(name, lockId).catch(err => { 
      console.log(err);
      return false;
    });
    if(this.ctx.opts.logging.queue)
      console.log("aquiring lock => ", result);
    if(result){
      const qex = await this.ctx.net.RedisClient.expire(name, QUEUE_TIMEOUT).catch(err => false);
      console.assert(qex, "[KernelJs] ~ queue failed to set expire");
      if(this.ctx.opts.logging.queue)
        console.log("[KernelJs] ~ queue aquired ", name, lockId);
      return true;
    }
    const ttl = await this.ctx.net.RedisClient.ttl(name).catch(err => false);
    if(!ttl){
      await this.keepAlive(name)
      return false;
    }
  }
  async _queueReleaseLock(name, lockId){
    if(!Array.isArray(this.ctx.opts.settings['kernel.exlusive.queue'])) this.ctx.opts.settings['kernel.exlusive.queue'] = [];
    const result = await this.ctx.net.RedisClient.get(name).catch(err => false);
    if(result == null || result === false) return false;
    if(result != lockId) {
      console.log("[KernelJs] ~ queue lost lock");
    }else{
      const qdl = await this.ctx.net.RedisClient.del(name).catch(err => false);
      console.assert(qdl, "[KernelJs] ~ queue failed to release lock");
    }
    if(this.ctx.opts.logging.queue)
      console.log("[KernelJs] ~ queue released ", name, lockId);
    await this.ctx.net.RedisClient.publish('deba.core.kernel.exlusive.queue', JSON.stringify({ lockId, name }));
    return true;
  }
}
