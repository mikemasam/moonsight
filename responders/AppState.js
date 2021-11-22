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
}


export default function CreateAppState(ctx){
  return new AppState(ctx);
}
