import { NotFound, EmptyResponse, UnhandledReponse } from '../../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export const notFoundRouter = async (ctx) => {
  const handler = await RouteHandler(ctx, async () => NotFound(), { _location: '/' });
  return [prepareHttpReq(ctx), handler]
}

export const RouteHandler = async (ctx, handler, stat) => {
  return (req, res) => {
    const log = {
      path: stat._location,
      ctx,
      startTime: Date.now(),
    };
    handler(req, res)
      .then(_r => _r?.responder ? _r : EmptyResponse())
      .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
      .then(_r => _r(log, req, res));
  }
}

const MiddlewaresHandler = async (ctx, handler, stat) => {
  return (req, res, next) => {
    //TODO: use locals:_lifetime for context & stat & startTime
    const log = {
      path: stat._location,
      ctx,
      startTime: Date.now(),
    };
    handler(ctx, req, res)
      .then(_r => _r?.responder ?  _r(log, req, res) : next())
      .catch(err => UnhandledReponse(err)(log, req, res))
  }
}


export const addIHttpRoute = async (ctx, router, stat, ihttp) => {
  if(!ihttp) return false;
  if(!ihttp.__ihandler) 
    throw `[Router] ~ ${stat._fullPath} http route doesn't return async IHttp handler.`;
  const [handler, middlewares] = ihttp(ctx, stat);
  //console.log(stat);
  const attachs = [];
  for(const name of middlewares){
    const md = ctx.net.middlewares.find(m => m.name == name);
    if(md?.action instanceof AsyncFn === false) 
      throw `[Router] ~ Unknown middleware [${name}] ~ ${stat._location}`;
    const _fn = await MiddlewaresHandler(ctx, md.action, stat);
    attachs.push(_fn);
  }
  const { opts } = ctx;
  const endpoint = await cleanRoutePath(stat._file);
  router.all(`/${endpoint}`, prepareHttpReq(ctx, stat), attachs, handler);
  ///return [middlewares, httpHandler];
}

const prepareHttpReq = (ctx, stat) =>{
  return (req, res, next) => {
    const _lifetime = {
      startTime: Date.now(),
      hoops: [],
      ctx,
      stat
    }
    req.locals = {
      _lifetime
    };
    return next();
  }
}


const cleanRoutePath = async (file) => {
  if(file == 'index.js') return '';
  return file.replace('.js', '').replace('[', ':').replace(']', '');
}

