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
  queue(name, opts){
    return this.ctx.queue.aquire(name, opts);
  }
  queueJob(name, opts){
    return this.ctx.events.emit(`kernel.jobs.run.${name}`, name, opts);
  }
  queuePub(name, payload){
    return this.ctx.events.emit(`kernel.subpub.pub`, name, payload);
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
}


export default function CreateAppState(ctx){
  return new AppState(ctx);
}
