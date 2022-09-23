import { AppState } from '../responders/index.js';
export default function IMount(handler, opts = []){
  function IMountHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[KernelJs] ~ ${stat._fullPath} IMount async handler function is required.`;
    //ctx.events.once("kernel.ready", () => {
    if(opts?.length && opts.indexOf("kernel.ready") > -1){
      ctx.events.once("kernel.ready", () => {
        handler(AppState(ctx), {
          path: stat._path,
          router: stat.router
        });
      });
    } else {
      ctx.events.once("kernel.corenet.ready", () => {
        handler(AppState(ctx), {
          path: stat._path,
          router: stat.router
        });
      });
    }
  };
  IMountHandler.__ihandler = 'imount';
  return IMountHandler;
}

