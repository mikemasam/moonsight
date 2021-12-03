import { AppState } from '../responders/index.js';
export default function IMount(handler){
  function IMountHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[Router] ~ ${stat._fullPath} IMount async handler function is required.`;
    handler(AppState(ctx), {
      path: stat._path,
      router: stat.router
    });
  };
  IMountHandler.__ihandler = 'imount';
  return IMountHandler;
}

