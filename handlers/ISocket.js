import { AppState, NotFound, EmptyResponse, UnhandledReponse } from '../responders/index.js';

export default function ISocket(handler, middlewares){
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
      handler(req, res, AppState(ctx))
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => {
          return _r(log, req, res);
        });
    }, middlewares];
  };

  ISocketHandler.__ihandler = 'isocket';
  return ISocketHandler;
}

