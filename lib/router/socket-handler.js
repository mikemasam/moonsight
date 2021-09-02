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

export const addISocketRoute = async (ctx, stat, isocket) => {
  if(!isocket) return false;
  if(!isocket.__ihandler) 
    throw `[Router] ~ ${stat._fullPath} socket route doesn't return async ISocket handler.`;
  const [handler, middlewares] = isocket(ctx, stat);
  const attachs = [];
  for(const name of middlewares){
    const md = ctx.net.middlewares.find(m => m.name == name);
    if(md?.action instanceof AsyncFn === false) 
      throw `[Router] ~ ISocket Unknown middleware [${name}] ~ ${stat._location}`;
    const _fn = await middlewaresHandler(ctx, md.action, stat);
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
    const originalUrl = endpoint;
    socket.on(endpoint, (data, fn) => {
      const req = { locals: {}, originalUrl, ip, method: 'isocket', socket, body: data,  }
      const res = { fn };
      const mds = [...middlewares, handler];
      const run = (req, res) => mds.shift()(req, res, run);
      return run(req, res);
    })
  });
}

const cleanRoutePath = async (file) => {
  return file.replace('/index.js', '').replace('.js', '').split('/').join(':');
}


