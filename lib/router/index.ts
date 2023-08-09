import fs from "fs";
import path from "path";
import { Router } from "express";
import logger from "../logger";
import { cleanRoutePath, notFoundRouter, addIHttpRoute } from "./http-handlers";
import { addISocketRoute, addISocketMount } from "./socket-handler";
import { addICoreRoute } from "./core-handler";
import { addIJobRoute } from "./job-handler";
import { addISubRoute } from "./sub-handler";
import { loadMiddlewares } from "./middlewares";
import { AppContext, AppContextOpts } from "../context";
import { IHandler } from "../../handlers/BaseHander";

export type RouteStat = {
  fullPath: string;
  file: string;
  dir: string;
  location: string;
  path: string;
  router: Router;
  dynamic_route: boolean;
  isFile: boolean;
  isDirectory: boolean;
};
export default async function HttpRouter() {
  const ctx = global.deba_kernel_ctx;
  const { net, opts } = ctx;
  const { httpApp } = net;
  if (opts.apiPath) {
    if (!fs.existsSync(opts.apiPath))
      throw `[KernelJs] ~ Invalid Route path [api] = ${opts.apiPath}.`;
    const root = Router({ mergeParams: true });
    logger.kernel("...............");
    if (opts.apiMiddlewares != null)
      ctx.net.middlewares = await loadMiddlewares(opts.apiMiddlewares);
    else ctx.net.middlewares = [];
    const stat = await mountPath(opts, root, ctx.opts.apiBasePath);
    //await loadRoutes(ctx, opts.apiPath, root, ctx.opts.basePath);
    const res = await addRouter(ctx, stat);
    logger.byType("loader", `Loader: ${stat.location}`, ` ~`, res);
    httpApp.use(root);
    const notFoundRoot = await notFoundRouter();
    httpApp.use(`*`, notFoundRoot as any);
  }
  return ctx;
}

const mountPath = async (
  opts: AppContextOpts,
  router: Router,
  location: string
) => {
  const fullPath = path.join(opts.apiPath);
  const stat = fs.statSync(fullPath);
  const routeStat: RouteStat = {
    fullPath: fullPath,
    file: opts.apiMount,
    dir: opts.apiPath,
    location: opts.apiMount.length == 0 ? "" : `/${opts.apiMount}`,
    path: cleanRoutePath(location),
    router: router,
    dynamic_route: false,
    isFile: stat.isFile(),
    isDirectory: stat.isDirectory(),
  };
  return routeStat;
};

const loadRoutes = async (
  ctx: AppContext,
  directory: string,
  router: Router,
  location: string
) => {
  const routes = fs.readdirSync(directory).map((file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    const routeStat: RouteStat = {
      fullPath: fullPath,
      file: file,
      dir: directory,
      location: `${location}/${file}`,
      path: cleanRoutePath(location),
      router: router,
      dynamic_route: file.indexOf("[") > -1,
      isFile: stat.isFile(),
      isDirectory: stat.isDirectory(),
    };
    return routeStat;
  });
  const r1 = await Promise.all(
    routes
      .filter((r) => r.isDirectory && !r.dynamic_route)
      .map(async (stat) => {
        return addRouter(ctx, stat);
      })
  );

  const r2 = await Promise.all(
    routes
      .filter((r) => r.isFile && !r.dynamic_route)
      .map(async (stat) => {
        return addRoute(ctx, stat);
      })
  );

  const r3 = await Promise.all(
    routes
      .filter((r) => r.isDirectory && r.dynamic_route)
      .map(async (stat) => {
        return addRouter(ctx, stat);
      })
  );

  const r4 = await Promise.all(
    routes
      .filter((r) => r.isFile && r.dynamic_route)
      .map(async (stat) => {
        return addRoute(ctx, stat);
      })
  );
  let mounted_routes = [...r1, ...r2, ...r3, ...r4];
  const acc = counter();
  const keys = Object.keys(acc);
  for (let o = 0; o < mounted_routes.length; o++)
    for (let i = 0; i < keys.length; i++) {
      acc[keys[i]] += mounted_routes[o][keys[i]];
    }
  return acc;
};

const addRouter = async (ctx: AppContext, stat: RouteStat) => {
  const root = Router({ mergeParams: true });
  const total = await loadRoutes(ctx, stat.fullPath, root, stat.location);
  if (total.ihttp < 1) {
    logger.byType("components", `Components: ${stat.location}`);
    return total;
  }
  const endpoint = stat.file.replace("[", ":").replace("]", "");
  total.ihttpmount++;
  logger.byType("httpmount", `IHttpMount: ${stat.location}`, endpoint);
  stat.router.use(`/${endpoint}`, root);
  return total;
};

const counter = (): { [key: string]: number } => {
  return {
    icom: 0,
    isub: 0,
    ijob: 0,
    imount: 0,
    isocketmount: 0,
    ihttp: 0,
    ihttpmount: 0,
    icore: 0,
    isocket: 0,
  };
};
const addRoute = async (ctx: AppContext, stat: RouteStat) => {
  const found = counter();
  if (!stat.file.match(/\.js|\.ts$/)) {
    logger.byType("components", `route skipped ${stat.fullPath}`);
    return found;
  }
  const routes = await loadRouteModule(stat);
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (route?.__ihandler == "imount") {
      found.imount++;
      logger.byType("mount", `IMount: ${stat.location}`);
      route(stat);
    } else if (route?.__ihandler == "isocketmount") {
      found.isocketmount++;
      await addISocketMount(stat, route);
    } else if (route?.__ihandler == "ijob") {
      found.ijob++;
      await addIJobRoute(stat, route);
    } else if (route?.__ihandler == "isub") {
      found.isub++;
      await addISubRoute(stat, route);
    }
  }
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (route?.__ihandler == "ihttp") {
      found.ihttp++;
      await addIHttpRoute(stat.router, stat, route);
    } else if (route?.__ihandler == "isocket") {
      found.isocket++;
      await addISocketRoute(stat, route);
    } else if (route?.__ihandler == "icore") {
      found.icore++;
      await addICoreRoute(stat, route);
    } else {
      found.icom++;
    }
  }
  return found;
  //console.log("--------------------------------------------------")
};

const loadRouteModule = async (stat: RouteStat): Promise<IHandler<any>[]> => {
  const module = await import(stat.fullPath);
  const routes = Object.keys(module).filter((n) => n != "default");
  return routes.map((r) => module[r]);
};
