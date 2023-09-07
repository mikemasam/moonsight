import http from "http";
import express, { Express } from "express";
import cors from "cors";
import logger from "./logger";
import { AppContextOpts } from "./context";

export function createHttpApp(): Express {
  const app = express();
  app.use(express.json());
  app.use(cors());
  return app;
}
export function createHttpServer(httpApp: Express): http.Server {
  return new http.Server(httpApp);
}
export function createCoreServer(opts: AppContextOpts): http.Server {
  return http.createServer();
}
export async function bootHttpApp() {
  const ctx = global.deba_kernel_ctx;
  ctx.cleanup.add("HttpServer", () => {
    ctx.net.httpServer?.unref();
    ctx.net.httpServer?.close();
  });
  ctx.cleanup.add("CoreServer", () => {
    ctx.net.coreServer?.unref();
    ctx.net.coreServer?.close();
  });

  ctx.net.startup = () => {
    if (ctx.net.coreServer && ctx.opts.mountCore?.mount) {
      ctx.net.coreServer.listen(ctx.opts.mountCore.port, "0.0.0.0", () => {
        logger.kernel(`CoreNet: host:${ctx.opts.mountCore?.port}`);
      });
    }
    if (ctx.net.httpServer) {
      ctx.net.httpServer.listen(ctx.opts.port, "0.0.0.0", () => {
        logger.kernel(`Http&SocketIO: host:${ctx.opts.port}`);
        ctx.events.emit("kernel.internal.http.ready");
      });
    }
  };
  return ctx;
}
