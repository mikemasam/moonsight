import { AppState, NotFound, FailedResponse, EmptyResponse, UnhandledReponse } from '../responders/index.js';
import UID from '../lib/universal.identity.js';
const AsyncFn = (async () => {}).constructor;

export default function IHttp(handler, middlewares, config = {}){

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
      if(config && config.minVersion && !UUID.latestVersion(req.headers['appversion']))
        return FailedResponse({ message: "Please update to latest version to continue" })(log, req, res);
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

