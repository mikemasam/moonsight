import { AppState, NotFound, FailedResponse, EmptyResponse, UnhandledReponse } from '../responders/index.js';
export default function ICore(handler, middlewares){
  function ICoreHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[KernelJs] ~ ${stat._fullPath} ICore async handler function is required.`;

    return [(req, res) => {
      const log = {
        path: stat._location,
        ctx,
        startTime: Date.now(),
      };
      if(!ctx.ready) return FailedResponse()(log, req, res);
      ctx.state.count++;
      handler(req, res, AppState(ctx))
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => {
          ctx.state.count--;
          return _r(log, req, res)
        });
    }, middlewares];
  };

  ICoreHandler.__ihandler = 'icore';
  return ICoreHandler;
}

