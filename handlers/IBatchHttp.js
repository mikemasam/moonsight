import { Request, Response, AppState, NotFound, EmptyResponse, UnhandledReponse } from '../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export default function IBatchHttp(routes, middlewares){
  function IHttpHandler(ctx, stat){
    for(const key in routes){
      const route = routes[key];
      if(route instanceof AsyncFn !== true) 
        throw `[Router] ~ ${stat._fullPath} async handler function is required.`;
    }

    return [(req, res) => {
      const { startTime } = res.__locals;
      const log = {
        path: stat._location,
        ctx,
        startTime 
      };
      const body = req.body;
      const state = Request(req);
      const results = {};
      const tasks = [];
      for(const key in body){
        const route = routes[key];
        if(route){
          tasks.push(route(body[key], state, AppState(ctx))?.catch(e => null).then(result => {
            results[key] = result;
          }));
        }else{
          results[key] = null;
        }
      }
      Promise.all(tasks).then(() => Response(results)(log, req, res));
      /*
      handler(req, res, AppState(ctx))
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => );
        */
    }, middlewares];
  };

  IHttpHandler.__ihandler = 'ihttp';
  return IHttpHandler;
}

