import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { notFoundRouter, addIHttpRoute } from './http-handlers.js';
import { addISocketRoute } from './socket-handler.js';
import { addICoreRoute } from './core-handler.js';
import { loadMiddlewares } from './middlewares.js';
const AsyncFn = (async () => {}).constructor;


export default async function HttpRouter(ctx) {
  const { net, opts } = ctx;
  const { httpApp } = net;
  if(opts.apiPath){
    if(!fs.existsSync(opts.apiPath)) 
      throw `[Router] ~ Invalid Route path [api] = ${opts.apiPath}.`;
    const root = Router({ mergeParams : true });
    ctx.net.middlewares = await loadMiddlewares(ctx, opts.middlewares)
    await loadRoutes(ctx, opts.apiPath, root, `/${opts.apiMount}`);
    httpApp.use(`/${opts.apiMount}`, root);
    const notFoundRoot = await notFoundRouter(ctx);
    httpApp.use(`*`, notFoundRoot);
  }
  return ctx;
}

const loadRoutes = async (ctx, directory, router, location) => {
  const routes = fs.readdirSync(directory).map(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    stat._fullPath = fullPath;
    stat._file = file;
    stat._dir = directory;
    stat._location = `${location}/${file}`;
    stat._dynamic_route = file.indexOf('[') > -1;
    return stat;
  });

  await Promise.all(routes.filter(r => r.isDirectory() && !r._dynamic_route).map(async (stat) => {
    return addRouter(ctx, router, stat);
  }));

  await Promise.all(routes.filter(r => r.isFile() && !r._dynamic_route).map(async (stat) => {
    return addRoute(ctx, router, stat);
  }));

  await Promise.all(routes.filter(r => r.isDirectory() && r._dynamic_route).map(async (stat) => {
    return addRouter(ctx, router, stat);
  }));

  await Promise.all(routes.filter(r => r.isFile() && r._dynamic_route).map(async (stat) => {
    return addRoute(ctx, router, stat);
  }));

}

const addRouter = async (ctx, router, stat) => {
  if(stat._file == 'components') return;
  const { opts } = ctx;
  const root = Router({ mergeParams : true });
  await loadRoutes(ctx, stat._fullPath, root, stat._location);
  const endpoint = stat._file.replace('[', ':').replace(']', '');
  if(opts.logging?.http)
    console.log(`[Router] ~ IHttp: ${stat._location}`, endpoint);
  router.use(`/${endpoint}`,root);
}

const addRoute = async (ctx, router, stat) => {
  if(!stat._file.match(/\.js$/)) {
    console.log(`route skipped ${stat._fullPath}`);
    return;
  }
  const { opts } = ctx;
  const routes = await loadRouteModule(ctx, stat);
  //console.log("--------------------------------------------------")
  for(let i = 0; i < routes.length; i++){
    const route = routes[i];
    if(route?.__ihandler == 'ihttp')
      await addIHttpRoute(ctx, router, stat, route);
    if(route?.__ihandler == 'isocket')
      await addISocketRoute(ctx, stat, route);
    if(route?.__ihandler == 'icore')
      await addICoreRoute(ctx, stat, route);
  }
  //console.log("--------------------------------------------------")
}

const loadRouteModule = async (ctx, stat) => {
  const module = await import(stat._fullPath);
  if(module?.default instanceof AsyncFn === true) module?.default(ctx);
  const routes = Object.keys(module).filter(n => n != 'default');
  /*
  //console.log();
  //console.log(module.ihttp?.__ihandler);
  const ihttp = module.ihttp;
  const isocket = module.isocket;
  const icore = module.icore;
  //[ihttp, isocket, icore]
  */
  return routes.map(r => module[r]);
}


