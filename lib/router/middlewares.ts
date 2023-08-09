import fs from "fs";
import path from "path";
import { IMiddlewareHandler } from "../../handlers/BaseHander";

const AsyncFn = (async () => null).constructor;
export const loadMiddlewares = async (location: string) => {
  if (!location) return [];
  if (!fs.existsSync(`${location}`))
    throw `[KernelJs] ~ Invalid Middleware location ${location}.`;
  const middlewares = await getMiddlewares(location);
  return middlewares;
};

type MiddlewareStat = {
  file: string;
  fullPath: string;
  isDirectory: boolean;
  isFile: boolean;
};
export type IHttpMiddleware = {
  name: string;
  action: IMiddlewareHandler;
};

const getMiddlewares = async (
  directory: string
): Promise<IHttpMiddleware[]> => {
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
  const mids: IHttpMiddleware[] = [];

  for (let i = 0; i < routes.length; i++) {
    const stat = routes[i];
    if (stat.isDirectory) {
      const nested = await getMiddlewares(stat.fullPath);
      mids.push(...nested);
    } else if (stat.isFile) {
      const action = await loadMiddleware(stat.fullPath);
      const md: IHttpMiddleware = {
        name: cleanName(stat.file),
        action,
      };
      mids.push(md);
    }
  }
  return mids;
};

const loadMiddleware = async (
  location: string
): Promise<IMiddlewareHandler> => {
  const module = await import(`${location}`);
  if (module.default instanceof AsyncFn !== true)
    throw `[KernelJs] ~ ${location} middleware doesn't return async handler function.`;
  return module.default;
};

const cleanName = (file: string) => {
  return file.replace(".js", "").replace("ts", "");
};
