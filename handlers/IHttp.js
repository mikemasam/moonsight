import { AppState, NotFound, FailedResponse, EmptyResponse, UnhandledReponse } from '../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export default function IHttp(handler, middlewares){

  function IHttpHandler(ctx, stat){
    if(handler instanceof AsyncFn !== true) 
      throw `[KernelJs] ~ ${stat._fullPath} async handler function is required.`;

    return [(req, res) => {
      const { startTime } = res.__locals;
      const log = {
        path: stat._location,
        ctx,
        startTime 
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

  IHttpHandler.__ihandler = 'ihttp';
  return IHttpHandler;
}

