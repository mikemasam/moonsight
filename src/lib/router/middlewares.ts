import fs from "fs";
import path from "path";
import {
  IAnyMiddlewareRoute,
  IHandler,
  IHttpMiddlewareHandler,
  ISocketMiddlewareHandler,
  MiddlewareStat,
  RouteStat,
} from "../../handlers/BaseHander";
import logger from "../logger";

const AsyncFn = (async () => null).constructor;
export default async function loadMiddlewares(location: string) {
  if (!location) {
    logger.byType("middleware", `Empty middleware location -> ${location}`);
    return [];
  }
  if (!fs.existsSync(`${location}`))
    throw `[KernelJs] ~ Invalid Middleware location ${location}.`;
  const middlewares = await getMiddlewares(location);
  return middlewares;
}

const getMiddlewares = async (
  directory: string
): Promise<IAnyMiddlewareRoute[]> => {
  const routes = fs.readdirSync(directory).map((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    const _stat: MiddlewareStat = {
      file: file,
      fullPath: fullPath,
      isDirectory: stat.isDirectory(),
      isFile: stat.isFile(),
    };
    return _stat;
  });
  const mids: IAnyMiddlewareRoute[] = [];
  for (let i = 0; i < routes.length; i++) {
    const stat = routes[i];
    if (stat.isDirectory) {
      const nested = await getMiddlewares(stat.fullPath);
      mids.push(...nested);
    } else if (stat.isFile) {
      const action = await loadMiddleware(stat.fullPath);
      if (action?.__ihandler != "ihttp.middleware") continue;
      const md: IAnyMiddlewareRoute = {
        name: cleanName(stat.file),
        action: action(stat as RouteStat),
      };
      mids.push(md);
    }
  }
  return mids;
};

const loadMiddleware = async (
  location: string
): Promise<IHandler<IHttpMiddlewareHandler | ISocketMiddlewareHandler>> => {
  const module = await import(`${location}`);
  return module.default;
};

const cleanName = (file: string) => {
  return file.replace(".js", "").replace(".ts", "");
};
