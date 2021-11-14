import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { cleanRoutePath, notFoundRouter, addIHttpRoute } from './http-handlers.js';
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
    const basePath = opts.apiMount && opts.apiMount?.length ? `/${opts.apiMount}` : '';
    await loadRoutes(ctx, opts.apiPath, root, basePath);
    httpApp.use(basePath, root);
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
    stat._path = cleanRoutePath(stat._location);
    stat.router = router;
    stat._dynamic_route = file.indexOf('[') > -1;
    return stat;
  });

  const r1 = await Promise.all(routes.filter(r => r.isDirectory() && !r._dynamic_route).map(async (stat) => {
    return addRouter(ctx, stat);
  }));

  const r2 = await Promise.all(routes.filter(r => r.isFile() && !r._dynamic_route).map(async (stat) => {
    return addRoute(ctx, stat);
  }));

 const r3 = await Promise.all(routes.filter(r => r.isDirectory() && r._dynamic_route).map(async (stat) => {
    return addRouter(ctx, stat);
  }));

 const r4 = await Promise.all(routes.filter(r => r.isFile() && r._dynamic_route).map(async (stat) => {
    return addRoute(ctx, stat);
  }));
  return [...r1, ...r2, ...r3, ...r4].reduce((a, b) => a+b, 0);
}

const addRouter = async (ctx, stat) => {
  const { opts } = ctx;
  const root = Router({ mergeParams : true });
  const total = await loadRoutes(ctx, stat._fullPath, root, stat._location);
  if(opts.logging?.loader)
    console.log(`[Loader] ~ ${stat._location}`, ` [~${total}]`);
  //console.log("Total routes =>", root.stack.length, stat._location, total);
  if(total < 1) {
    if(opts.logging?.components)
      console.log(`[Router] ~ Components: ${stat._location}`);
    return 0;
  }
  const endpoint = stat._file.replace('[', ':').replace(']', '');
  if(opts.logging?.http)
    console.log(`[Router] ~ IHttp: ${stat._location}`, endpoint);
  stat.router.use(`/${endpoint}`,root);
  return total;
}

const addRoute = async (ctx, stat) => {
  if(!stat._file.match(/\.js$/)) {
    console.log(`route skipped ${stat._fullPath}`);
    return 0;
  }
  const { opts } = ctx;
  const routes = await loadRouteModule(ctx, stat);
  //console.log("--------------------------------------------------")
  let found = 0;
  for(let i = 0; i < routes.length; i++){
    const route = routes[i];
    if(route?.__ihandler == 'imount'){
      route(ctx, stat);
    }else if(route?.__ihandler == 'ihttp'){
      found++;
      await addIHttpRoute(ctx, stat.router, stat, route);
    }else if(route?.__ihandler == 'isocket'){
      found++;
      await addISocketRoute(ctx, stat, route);
    }else if(route?.__ihandler == 'icore'){
      found++;
      await addICoreRoute(ctx, stat, route);
    }
  }
  return found;
  //console.log("--------------------------------------------------")
}

const loadRouteModule = async (ctx, stat) => {
  const module = await import(stat._fullPath);
  //console.log(module);
  //console.log(stat);
  /*
  if(module?.default instanceof AsyncFn === true){
    module?.default(ctx, {
      path: stat._path,
      router: stat.router
    });
  }
  */
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


