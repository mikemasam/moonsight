class AppState {
  constructor(ctx){
    this.ctx = ctx; 
  }
  events(){
    return this.ctx.events;
  }
  io(){
    return this.ctx.net.socketIO;
  }
  channel(){
    return this.ctx.opts.channelName;
  }

  //dictionary
  get(name){
    return this.ctx.opts.settings[name];
  }
  put(name, data){
    this.ctx.opts.settings[name] = data;
  }

  //stack
  push(name, data){
    this.ctx.opts.settings[name]?.push(data);
    console.log('AppState.push --> removed')
  }
  remove(name, index){
    console.log('AppState.remove --> removed')
    return this.ctx.opts.settings[name]?.splice(index, 1);
  }

  //queue
  async queue(name, wait = true){
    if(!Array.isArray(this.get(name))) this.put(name, [])
    if(!Array.isArray(this.get('kernel.appstate.queue.current'))) this.put('kernel.appstate.queue.current', [])
    const lock = Math.random();
    return new Promise((resolve) => {
      const onprogress = this.get(`kernel.appstate.queue.current`).findIndex(t => t.name == name);
      if(onprogress < 0){
        this.get(`kernel.appstate.queue.current`).push({ lock, resolve, name });
        resolve({
          lock,
          clear: async () => this.clearQueue(lock)
        });
      }else{
        if(wait){
          this.get(name).push({ lock, resolve, name });
        }else{
          resolve(false);
        }
      }
    });
  }
  async clearQueue(lock){
    if(!Array.isArray(this.get('kernel.appstate.queue.current')))
      this.put('kernel.appstate.queue.current', [])
    const index = this.get(`kernel.appstate.queue.current`).findIndex(t => t.lock == lock);
    if(index < 0) return;
    const last = this.get(`kernel.appstate.queue.current`)[index];
    if(!Array.isArray(this.get(last.name))) this.put(last.name, [])
    const task = this.get(last.name).shift();
    if(task){
      this.get(`kernel.appstate.queue.current`).splice(index, 1, task)
      //task.resolve(task.lock);
      task.resolve({
        lock: task.lock,
        clear: async () => this.clearQueue(task.lock)
      });
      //console.log('new task pushed');
    }else{
      //console.log('no new task');
      this.get(`kernel.appstate.queue.current`).splice(index, 1)
    }
  }
}


export default function CreateAppState(ctx){
  return new AppState(ctx);
}
