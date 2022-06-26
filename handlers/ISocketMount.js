import { AppState, NotFound, EmptyResponse, UnhandledReponse } from '../responders/index.js';
export default function ISocketMount(handler){
  function ISocketMountHandler(ctx, stat){
    const AsyncFn = (async () => {}).constructor;
    if(handler instanceof AsyncFn !== true) 
      throw `[Router] ~ ${stat._fullPath} ISocketMount async handler function is required.`;
    return async (req, res, next) => {
      const log = {
        path: stat._location,
        ctx,
        startTime: Date.now(),
      };
      return handler(req, AppState(ctx))
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => {
          return _r?.responder ? _r(log, req, res) : next();
        });
    }
  };
  ISocketMountHandler.__ihandler = 'isocketmount';
  return ISocketMountHandler;
}

