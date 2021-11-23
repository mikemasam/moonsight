class AppState {
  constructor(ctx){
    this.ctx = ctx; 
  }
  events(){
    return this.ctx.events;
  }
  channel(){
    return this.ctx.opts.channelName;
  }
  get(name){
    return (this.ctx.opts.settings || {})[name];
  }
  put(name, data){
    this.ctx.opts.settings[name] = data;
  }
  push(name, data){
    this.ctx.opts.settings[name]?.push(data);
  }
  remove(name, index){
    this.ctx.opts.settings[name]?.splice(index, 1);
  }
}


export default function CreateAppState(ctx){
  return new AppState(ctx);
}
