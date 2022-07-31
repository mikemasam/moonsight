import { AppState, NotFound, EmptyResponse, UnhandledReponse } from '../../responders/index.js';
const AsyncFn = (async () => {}).constructor;

const middlewaresHandler = async (ctx, handler, stat, args) => {
  return async (req, res, next) => {
    const log = {
      path: stat._location,
      opts: ctx.opts,
      startTime: Date.now(),
    };
    return handler(AppState(ctx), req, res, args)
      .then(_r => _r?.responder ?  _r(log, req, res) : next(req, res))
      .catch(err => UnhandledReponse(err)(log, req, res))
  }
}

export const addISocketRoute = async (ctx, stat, isocket) => {
  if(!isocket) return false;
  if(!isocket.__ihandler) 
    throw `[Router] ~ ${stat._fullPath} socket route doesn't return async ISocket handler.`;
  const [handler, middlewares = []] = isocket(ctx, stat);
  const attachs = [];
  for(const middleware of middlewares){
    const name = typeof middleware == 'string' ? middleware : middleware?.name;
    const md = ctx.net.middlewares.find(m => m.name == name);
    if(md?.action instanceof AsyncFn === false) 
      throw `[Router] ~ ISocket Unknown middleware [${name}] ~ ${stat._location}`;
    const args = typeof name == 'string' ? {} : middleware;
    const _fn = await middlewaresHandler(ctx, md.action, stat, args);
    attachs.push(_fn);
  }
  const endpoint = await cleanRoutePath(stat._location);
  const { opts } = ctx;
  if(opts.logging?.socket)
    console.log(`[Router] ~ ISocket: ${stat._location}`, endpoint);
  queueEndpoint(ctx, endpoint, handler, attachs);
}

const queueEndpoint = async (ctx, endpoint, handler, middlewares) => {
  const { socketIO } = ctx.net;
  socketIO.on("connection", socket => {
    const ip = socket.handshake.address;
    socket.locals = { ip, ...socket.locals };
    const originalUrl = endpoint;
    socket.on(endpoint, (data, fn) => {
      const req = { socket, originalUrl, ip, method: 'isocket', body: data, __type: 'isocket' };
      const res = { fn };
      const mds = [...middlewares, handler];
      const run = (req, res) => mds.shift()(req, res, run);
      return run(req, res);
    })
  });
}

//socket io middleware
export const addISocketMount = async (ctx, stat, isocketmount) => {
  const { socketIO } = ctx.net;
  const originalUrl = await cleanRoutePath(stat._location);
  const handler = isocketmount(ctx, stat);
  socketIO.use((socket, next) => {
    const ip = socket.handshake.address;
    socket.locals = { ip, ...socket.locals };
    const req = { 
      socket, 
      ip, 
      originalUrl,
      method: 'isocketmount', 
      __type: 'isocketmount',
      handshake: socket.handshake, 
      query: socket.handshake.query, 
    };
    const fn = (response) => {
      if(parseInt(req.query.explain) === 0){
        //for buggy socket implemetation
        const err = new Error(`${response.message} --x`);
        next(err);
      }else{
        const err = new Error(response.message);
        err.data = response.data;
        err.status = response.status;
        next(err);
      }
    };
    const res = { fn };
    handler(req, res, next);
  });
}
//console.log(handler);

const cleanRoutePath = async (file) => {
  return file.replace('/index.js', '').replace('.js', '').split('/').join(':');
}


