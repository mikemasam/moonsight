import http from 'http';
import express  from 'express';
import cors from 'cors';

export default async function HttpApp(ctx) {
  const { opts } = ctx;
  ctx.net.httpApp = express();
  ctx.net.httpApp.use(express.json());
  ctx.net.httpApp.use(cors());
  ctx.net.httpServer = http.Server(ctx.net.httpApp);
  if(opts.mountCore.mount){
    ctx.net.coreServer = http.createServer(() => {});
  }
  return ctx;
}
