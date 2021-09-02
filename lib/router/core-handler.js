import { NotFound, EmptyResponse, UnhandledReponse } from '../../responders/index.js';
const AsyncFn = (async () => {}).constructor;

const middlewaresHandler = async (ctx, handler, stat) => {
  return async (req, res, next) => {
    const log = {
      path: stat._location,
      ctx,
      startTime: Date.now(),
    };
    return handler(ctx, req, res)
      .then(_r => _r?.responder ?  _r(log, req, res) : next(req, res))
      .catch(err => UnhandledReponse(err)(log, req, res))
  }
}

export const addICoreRoute = async (ctx, stat, icore) => {
  const { opts } = ctx;
  if(!icore) return false;
  if(!icore.__ihandler) 
    throw `[Router] ~ ${stat._fullPath} core route doesn't return async ICore handler.`;
  const [handler, middlewares] = icore(ctx, stat);
  const attachs = [];
  for(const name of middlewares){
    const md = ctx.net.middlewares.find(m => m.name == name);
    if(md?.action instanceof AsyncFn === false) 
      throw `[Router] ~ ICore Unknown middleware [${name}] ~ ${stat._location}`;
    const _fn = await middlewaresHandler(ctx, md.action, stat);
    attachs.push(_fn);
  }
  const endpoint = await cleanRoutePath(stat._location);
  if(opts.logging?.core)
  console.log(`[Router] ~ ICore: ${stat._location}`, endpoint);
  if(opts.mountCore){
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
    socket.on(endpoint, (data, fn) => {
      const { body } = data;
      const req = { method: 'icore', socket, body, originalUrl, ip }
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
    socket.on(endpoint, (data, fn) => {
      const { body, channel } = data;
      const req = { locals: {}, method: 'icore', socket, body, originalUrl, ip }
      const res = { fn };
      handler(req, res);
    })
  });
}

const cleanRoutePath = async (file) => {
  return file.replace('/index.js', '').replace('.js', '').split('/').join(':');
}

