import fs from "fs";
import path from "path";
import { Router } from "express";
import logger from "../logger";
import { cleanRoutePath, notFoundRouter, addIHttpRoute } from "./http-handlers";
import { addISocketRoute, addISocketMount } from "./socket-handler";
import { addICoreRoute } from "./core-handler";
import { addIJobRoute } from "./job-handler";
import { addISubRoute } from "./sub-handler";
import loadMiddlewares from "./middlewares";
import { AppContext, AppContextOpts } from "../context";
import { IHandler, RouteStat } from "../../handlers/BaseHander";
import { addIConsoleRoute } from "./console-handlers";

export default async function HttpRouter() {
  const ctx = global.deba_kernel_ctx;
  const { net, opts } = ctx;
  const { httpApp } = net;
  if (opts.apiPath) {
    if (!fs.existsSync(opts.apiPath))
      throw `[KernelJs] ~ Invalid Route path [api] = ${opts.apiPath}.`;
    const root = Router({ mergeParams: true });
    logger.kernel("...............");
    if (opts.apiMiddlewares != null && ctx.appRuntimeType == "node")
      ctx.net.middlewares = await loadMiddlewares(opts.apiMiddlewares);
    else ctx.net.middlewares = [];
    const stat = await mountPath(opts, root, ctx.opts.apiBasePath);
    const res = await addRouter(ctx, stat);
    if (httpApp != null) {
      logger.byType("debug", `Loader: ${stat.location}`, ` ~`, res);
      httpApp.use(root);
      httpApp.use("*", notFoundRouter() as any);
    }
  }
  return ctx;
}

const mountPath = async (
  opts: AppContextOpts,
  router: Router,
  location: string,
) => {
  const fullPath = path.join(opts.apiPath);
  const stat = fs.statSync(fullPath);
  const routeStat: RouteStat = {
    pos: 0,
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
  router: Router,
  $stat: RouteStat,
) => {
  const routes = fs.readdirSync($stat.fullPath).map((file) => {
    const fullPath = path.join($stat.fullPath, file);
    const stat = fs.statSync(fullPath);
    logger.byType(
      "internal",
      "reading directory",
      fullPath,
      ", output: ",
      stat,
    );
    const routeStat: RouteStat = {
      pos: $stat.pos + 1,
      fullPath: fullPath,
      file: file,
      dir: $stat.fullPath,
      location: `${$stat.location}/${file}`,
      path: cleanRoutePath($stat.location),
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
      }),
  );

  const r2 = await Promise.all(
    routes
      .filter((r) => r.isFile && !r.dynamic_route)
      .map(async (stat) => {
        return addRoute(ctx, stat);
      }),
  );

  const r3 = await Promise.all(
    routes
      .filter((r) => r.isDirectory && r.dynamic_route)
      .map(async (stat) => {
        return addRouter(ctx, stat);
      }),
  );

  const r4 = await Promise.all(
    routes
      .filter((r) => r.isFile && r.dynamic_route)
      .map(async (stat) => {
        return addRoute(ctx, stat);
      }),
  );
  let mounted_routes = [...r1, ...r2, ...r3, ...r4];
  const acc = counter();
  const keys = Object.keys(acc);
  for (let o = 0; o < mounted_routes.length; o++) {
    for (let i = 0; i < keys.length; i++) {
      acc[keys[i]] += mounted_routes[o][keys[i]];
    }
  }
  logger.byType("internal", acc);
  return acc;
};

const addRouter = async (ctx: AppContext, stat: RouteStat) => {
  const root = Router({ mergeParams: true });
  const total = await loadRoutes(ctx, root, stat);
  if (total.ihttp < 1) {
    logger.byType("internal", stat, total);
    logger.byTypes(["components", "debug"], `Components: ${stat.location}`);
    return total;
  }
  const endpoint = stat.file.replace("[", ":").replace("]", "");
  total.ihttpmount++;
  logger.byTypes(
    ["httpmount", "debug"],
    `IHttpMount: ${stat.location}`,
    endpoint,
  );
  stat.router.use(`/${endpoint}`, root);
  return total;
};

const counter = (): { [key: string]: number } => {
  return {
    icom: 0,
    isub: 0,
    ijob: 0,
    iconsole: 0,
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
    logger.byTypes(["components", "debug"], `route skipped ${stat.fullPath}`);
    return found;
  }
  const routes = await loadRouteModule(stat);
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (ctx.appRuntimeType == "cli") {
      if (route?.__ihandler == "iconsole") {
        found.iconsole++;
        await addIConsoleRoute(stat, route);
      }
      continue;
    }
    if (route?.__ihandler == "imount") {
      found.imount++;
      logger.byTypes(["mount", "debug"], `IMount: ${stat.location}`);
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
    } else {
      logger.byType(
        "debug",
        "expect component: ",
        route?.__ihandler,
        " -> ",
        stat.fullPath,
      );
      logger.byType(
        "internal",
        "expect component:",
        stat,
        route?.__ihandler,
        found,
      );
    }
  }
  for (let i = 0; i < routes.length; i++) {
    const route = routes[i];
    if (ctx.appRuntimeType == "cli") {
      continue;
    }
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
      logger.byType(
        "debug",
        "expect component: ",
        route?.__ihandler,
        " -> ",
        stat.fullPath,
      );
      logger.byType(
        "internal",
        "expect component:",
        stat,
        route?.__ihandler,
        found,
      );
    }
  }
  return found;
};

const loadRouteModule = async (
  stat: RouteStat,
): Promise<IHandler<any>[]> => {
  try {
    const _module = await import(stat.fullPath);
    const keys: string[] = [];
    for (var k in _module) keys.push(k);
    const routes = keys.filter((n) => n != "default");
    return routes.map((r) => _module[r]);
  } catch (e) {
    logger.byType("debug", `Module not loadable: ${stat.fullPath}`);
    return [];
  }
};
