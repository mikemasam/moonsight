import { AppState, NotFound, FailedResponse, EmptyResponse, UnhandledReponse } from '../responders/index.js';
import UID from '../lib/universal.identity.js';
export default function ISocketMount(handler, _, config){
  function ISocketMountHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[KernelJs] ~ ${stat._fullPath} ISocketMount async handler function is required.`;
    return async (req, res, next) => {
      const log = {
        path: stat._location,
        ctx,
        startTime: Date.now(),
      };
      if(!ctx.ready) return FailedResponse()(log, req, res);
      if(config && !UUID.latestVersion(req.query.appversion, config.minVersion || false))
        return FailedResponse({ 
          status: 405, 
          data: { status: 405 },
          message: "Please update to latest version to continue" 
        })(log, req, res);
      ctx.state.count++;
      return handler(req, AppState(ctx))
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => {
          ctx.state.count--;
          return _r?.responder ? _r(log, req, res) : next();
        });
    }
  };
  ISocketMountHandler.__ihandler = 'isocketmount';
  return ISocketMountHandler;
}

