import { AppState } from '../responders/index.js';
export default function ISocketMount(handler){
  function ISocketMountHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[Router] ~ ${stat._fullPath} ISocketMount async handler function is required.`;
    return async (req) => handler(req, AppState(ctx))
  };
  ISocketMountHandler.__ihandler = 'isocketmount';
  return ISocketMountHandler;
}

