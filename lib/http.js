import http from 'http';
import express  from 'express';

export default async function HttpApp(ctx) {
  const app = express();
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
