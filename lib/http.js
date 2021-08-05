import http from 'http';
import express  from 'express';
import cors from 'cors';

export default async function HttpApp(ctx) {
  const app = express();
  app.use(cors());
  const _httpServer = http.Server(app);
  return {
    ...ctx,
    net: {
      ...ctx.net,
      _httpServer,
      app,
    }
  }
}
