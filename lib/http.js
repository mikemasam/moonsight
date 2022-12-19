import http from 'http';
import express  from 'express';
import cors from 'cors';
import logger from './logger.js';

export default async function HttpApp(ctx) {
  const { opts } = ctx;
  ctx.net.httpApp = express();
  ctx.net.httpApp.use(express.json());
  ctx.net.httpApp.use(cors());
  ctx.net.httpServer = http.Server(ctx.net.httpApp);
  if(opts.mountCore.mount){
    ctx.net.coreServer = http.createServer(() => {});
  }
  ctx.cleanup.add("HttpServer", () => {
    ctx.net.httpServer?.unref();
    ctx.net.httpServer?.close();
  });
  ctx.cleanup.add("CoreServer", () => {
    ctx.net.coreServer?.unref();
    ctx.net.coreServer?.close();
  });

  ctx.net.startup = () => {
    if(ctx.net.coreServer){
      ctx.net.coreServer.listen(ctx.opts.mountCore.port, '0.0.0.0', () => {
        logger.kernel(`CoreNet: host:${ctx.opts.mountCore.port}`)
      });
    }
    if(ctx.net.httpServer){
      ctx.net.httpServer.listen(ctx.opts.port, '0.0.0.0', () => {
        logger.kernel(`Http&SocketIO: host:${ctx.opts.port}`)
        ctx.events.emit('kernel.internal.http.ready');
      });
    }
  }
  return ctx;
}
