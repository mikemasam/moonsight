import { NotFound, EmptyResponse, UnhandledReponse } from '../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export default function IHttp(handler, middlewares){

  function IHttpHandler(ctx, stat){
    if(handler instanceof AsyncFn !== true) 
      throw `[Router] ~ ${stat._fullPath} async handler function is required.`;

    return [(req, res) => {
      //TODO: use locals:_lifetime for context & stat & startTime
      if(!req.locals?._lifetime?.startTime) 
        throw `[Router] ~ ${stat._fullPath} req.locals modification is not permitted.`;
      const { _lifetime } = req.locals;
      const log = {
        path: stat._location,
        ctx,
        startTime: _lifetime.startTime
      };
      handler(req, res)
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => _r(log, req, res));
    }, middlewares];
  };

  IHttpHandler.__ihandler = 'ihttp';
  return IHttpHandler;
}

