import { AppState, NotFound, FailedResponse, EmptyResponse, UnhandledReponse } from '../responders/index.js';
import UID from '../lib/universal.identity.js';

export default function ISocket(handler, middlewares, config){
  function ISocketHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[KernelJs] ~ ${stat._fullPath} ISocket async handler function is required.`;

    return [(req, res) => {
      const log = {
        path: stat._location,
        opts: ctx.opts,
        startTime: Date.now(),
      };
      if(!ctx.ready) return FailedResponse()(log, req, res);
      if(config && !UID.latestVersion(req.query.version, config.minVersion || false ))
        return FailedResponse({ 
          status: 405, 
          data: { status: 405 },
          message: "Please update to latest version to continue" 
        })(log, req, res);
      ctx.state.count++;
      handler(req, res, AppState(ctx))
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => {
          ctx.state.count--;
          return _r(log, req, res);
        });
    }, middlewares];
  };

  ISocketHandler.__ihandler = 'isocket';
  return ISocketHandler;
}

