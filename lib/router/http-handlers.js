import { AppState, NotFound, EmptyResponse, UnhandledReponse } from '../../responders/index.js';
const AsyncFn = (async () => {}).constructor;

export const notFoundRouter = async (ctx) => {
  const handler = await RouteHandler(ctx, async () => NotFound(), { _location: '/' });
  return [prepareHttpReq(ctx), handler]
}

export const RouteHandler = async (ctx, handler, stat) => {
  return (req, res) => {
    const log = {
      path: stat._location,
      opts: ctx.opts,
      startTime: Date.now(),
    };
    handler(req, res)
      .then(_r => _r?.responder ? _r : EmptyResponse())
      .catch(_r => _r?.responder ? _r : UnhandledReponse(_r))
      .then(_r => _r(log, req, res));
  }
}

const middlewaresHandler = async (ctx, handler, stat, args) => {
  return (req, res, next) => {
    //TODO: use locals:_lifetime for context & stat & startTime
    const log = {
      path: stat._location,
      opts: ctx.opts,
      startTime: Date.now(),
    };
    handler(AppState(ctx), req, res, args, addHook(res))
      .then(_r => _r?.responder ?  _r(log, req, res) : next())
      .catch(err => UnhandledReponse(err)(log, req, res))
  }
}

export const addIHttpRoute = async (ctx, router, stat, ihttp) => {
  if(!ihttp) return false;
  if(!ihttp.__ihandler) 
    throw `[KernelJs] ~ ${stat._fullPath} http route doesn't return async IHttp handler.`;
  const [handler, middlewares = []] = ihttp(ctx, stat);
  //console.log(stat);
  const attachs = [];
  for(const middleware of middlewares){
    const name = typeof middleware == 'string' ? middleware : middleware?.name;
    const md = ctx.net.middlewares.find(m => m.name == name);
    if(md?.action instanceof AsyncFn === false) 
      throw `[KernelJs] ~ Unknown middleware [${name}] ~ ${stat._location}`;
    const args = typeof middleware == 'string' ? {} : middleware;
    const _fn = await middlewaresHandler(ctx, md.action, stat, args);
    attachs.push(_fn);
  }
  const { opts } = ctx;
  const endpoint = cleanRoutePath(stat._file);
  router.all(`/${endpoint}`, prepareHttpReq(ctx, stat), attachs, handler);
  ///return [middlewares, httpHandler];
}

const prepareHttpReq = (ctx, stat) => {
  return (req, res, next) => {
    req.locals = { };
    req.__type = 'ihttp';
    res.__locals = {
      hooks: [],
      startTime: Date.now(),
    }
    return next();
  }
}

const addHook = (res) => {
  return (hook) => {
    res.__locals.hooks.push(hook);
  }
}


export const cleanRoutePath = (file) => {
  if(file == 'index.js') return '';
  let path = file
    .replace('/index.js', '')
    .replace('index.js', '')
    .replace('.js', '')
    .replace('[', ':')
    .replace(']', '');

  return path;
}

