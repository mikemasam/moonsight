import { Request, Response, AppState, NotFound, FailedResponse, EmptyResponse, UnhandledReponse } from '../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export default function IBatchHttp(routes, middlewares){
  function IBatchHttpHandler(ctx, stat){
    for(const key in routes){
      const route = routes[key];
      if(key == 'com')
        throw `[KernelJs] ~ ${stat._fullPath} 'com' route is not available.`;
      if(route instanceof AsyncFn !== true) 
        throw `[KernelJs] ~ ${stat._fullPath} async handler function is required.`;
    }
    const err = e => { 
      console.log(e); 
      return null; 
    };
    return [(req, res) => {
      const { startTime } = res.__locals;
      const log = {
        path: stat._location,
        ctx,
        startTime 
      };
      if(!ctx.ready) return FailedResponse()(log, req, res);
      ctx.state.count++;
      const body = req.body;
      const state = Request(req);
      const results = {};
      const tasks = [];
      const com = body['com'];
      for(const key in body){
        if(key =='com') continue;
        const route = routes[key];
        if(route){
          tasks.push(route({ ...com, ...body[key] }, state, AppState(ctx))?.catch(err).then(result => {
            results[key] = result;
          }));
        }else{
          results[key] = null;
        }
      }
      Promise.all(tasks).then(() => Response(results)(log, req, res));
      ctx.state.count--;
      /*
      handler(req, res, AppState(ctx))
        .then(_r => _r?.responder ? _r : EmptyResponse())
        .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
        .then(_r => );
        */
    }, middlewares];
  };

  IBatchHttpHandler.__ihandler = 'ihttp';
  return IBatchHttpHandler;
}

