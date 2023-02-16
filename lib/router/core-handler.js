import { AppState, NotFound, EmptyResponse, UnhandledReponse } from '../../responders/index.js';
const AsyncFn = (async () => {}).constructor;

const middlewaresHandler = async (ctx, handler, stat) => {
  return async (req, res, next) => {
    const log = {
      path: stat._location,
      ctx,
      startTime: Date.now(),
    };
    return handler(AppState(ctx), req, res)
      .then(_r => _r?.responder ?  _r(log, req, res) : next(req, res))
      .catch(err => UnhandledReponse(err)(log, req, res))
  }
}

export const addICoreRoute = async (ctx, stat, icore) => {
  const { opts } = ctx;
  if(!icore) return false;
  if(!icore.__ihandler) 
    throw `[KernelJs] ~ ${stat._fullPath} core route doesn't return async ICore handler.`;
  const [handler, middlewares = []] = icore(ctx, stat);
  const attachs = [];
  for(const middleware of middlewares){
    const name = typeof middleware == 'string' ? middleware : middleware?.name;
    const md = ctx.net.middlewares.find(m => m.name == name);
    if(md?.action instanceof AsyncFn === false) 
      throw `[KernelJs] ~ ICore Unknown middleware [${name}] ~ ${stat._location}`;
    const args = typeof name == 'string' ? {} : middleware;
    const _fn = await middlewaresHandler(ctx, md.action, stat, args);
    attachs.push(_fn);
  }
  const endpoint = await cleanRoutePath(stat._location);
  if(opts.logging?.core)
    console.log(`[KernelJs] ~ ICore: ${stat._location}`, endpoint);
  if(opts.mountCore.mount){
    handleLocalCoreNet(ctx, endpoint, handler, attachs);
  }else{
    handleRemoteCoreNet(ctx, endpoint, handler);
  }
}

const handleLocalCoreNet = async (ctx, endpoint, handler, middlewares) => {
  const { coreIO } = ctx.net;
  const originalUrl = endpoint;
  coreIO.on("connection", socket => {
    const ip = socket.handshake.address;
    socket.locals = {
      ip
    };
    socket.on(endpoint, (data, fn) => {
      const { body } = data;
      const req = { __type: 'icore', method: 'icore', socket, body, originalUrl, ip }
      const res = { fn };
      const mds = [...middlewares, handler];
      const run = (req, res) => mds.shift()(req, res, run);
      run(req, res);
    })
  });
}

const handleRemoteCoreNet = async (ctx, endpoint, handler, middlewares) => {
  const { events, opts } = ctx;
  const originalUrl = endpoint;
  events.on("kernel.corenet.connection", socket => {
    //console.log("remote route added", socket.io.opts.hostname);
    const ip = opts.coreHost;
    socket.on(endpoint, (body, fn) => {
      //const { body, channel } = data;
      const req = { locals: {}, method: 'icore', socket, body, originalUrl, ip }
      const res = { fn };
      const mds = [...middlewares, handler];
      const run = (req, res) => mds.shift()(req, res, run);
      run(req, res);
    })
  });
}

const cleanRoutePath = async (file) => {
  return file.replace('/index.js', '').replace('.js', '').split('/').join(':');
}


