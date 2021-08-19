import { NotFound, EmptyResponse, UnhandledReponse } from '../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export default function IHttp(handler, middlewares){

  if(handler instanceof AsyncFn !== true) 
    throw `[Router] ~ ${stat._fullPath} async handler function is required.`;

  function IHttpHandler(ctx, stat){
    return [(req, res) => {
      const log = {
        path: stat._location,
        ctx,
        startTime: Date.now(),
      };
      handler(req, res)
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => _r(log, req, res));
    }, middlewares];
  };

  IHttpHandler.__ihandler = true;
  return IHttpHandler;
}

