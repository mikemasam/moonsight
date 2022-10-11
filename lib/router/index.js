import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { cleanRoutePath, notFoundRouter, addIHttpRoute } from './http-handlers.js';
import { addISocketRoute, addISocketMount } from './socket-handler.js';
import { addICoreRoute } from './core-handler.js';
import { addIJobRoute } from './job-handler.js';
import { loadMiddlewares } from './middlewares.js';
const AsyncFn = (async () => {}).constructor;


export default async function HttpRouter(ctx) {
  const { net, opts } = ctx;
  const { httpApp } = net;
  if(opts.apiPath){
    if(!fs.existsSync(opts.apiPath)) 
      throw `[KernelJs] ~ Invalid Route path [api] = ${opts.apiPath}.`;
    const root = Router({ mergeParams : true });
    console.log("[KernelJs] ~ ...............");
    ctx.net.middlewares = await loadMiddlewares(ctx, opts.middlewares)
    const basePath = opts.apiMount && opts.apiMount?.length ? `/${opts.apiMount}` : '';
    const stat = await mountPath(opts, root, basePath);
    //await loadRoutes(ctx, opts.apiPath, root, basePath);
    const res = await addRouter(ctx, stat);
    if(opts.logging?.loader)
      console.log(`[KernelJs] ~ Loader: ${stat._location}`, ` ~`, res);
    httpApp.use(root);
    const notFoundRoot = await notFoundRouter(ctx);
    httpApp.use(`*`, notFoundRoot);
  }
  return ctx;
}

const mountPath = async (opts, router, location) => {
  const fullPath = path.join(opts.apiPath);
  const stat = fs.statSync(fullPath);
  stat._fullPath = fullPath;
  stat._file = opts.apiMount;
  stat._dir = opts.apiPath;
  stat._location = opts.apiMount.length == 0 ? '' : `/${opts.apiMount}`;
  stat._path = cleanRoutePath(stat._location);
  stat.router = router;
  stat._dynamic_route = false;
  return stat;
};

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
  let mounted_routes = [...r1, ...r2, ...r3, ...r4];
  const acc = counter();
  const keys = Object.keys(acc);
  for(let o = 0; o < mounted_routes.length; o++)
    for(let i = 0; i < keys.length; i++){
      acc[keys[i]] += mounted_routes[o][keys[i]]
    }
  return acc;
}

const addRouter = async (ctx, stat) => {
  const { opts } = ctx;
  const root = Router({ mergeParams : true });
  const total = await loadRoutes(ctx, stat._fullPath, root, stat._location);
  if(total.ihttp < 1) {
    if(opts.logging?.components)
      console.log(`[KernelJs] ~ Components: ${stat._location}`);
    return total;
  }
  const endpoint = stat._file.replace('[', ':').replace(']', '');
  total.ihttpmount++;
  if(opts.logging?.httpmount)
    console.log(`[KernelJs] ~ IHttpMount: ${stat._location}`, endpoint);
  stat.router.use(`/${endpoint}`,root);
  return total;
}

const counter = () => {
  return { icom: 0, ijob: 0, imount: 0, isocketmount: 0, ihttp: 0, ihttpmount: 0, icore: 0, isocket: 0 };
}
const addRoute = async (ctx, stat) => {
  const found = counter();
  if(!stat._file.match(/\.js$/)) {
    console.log(`route skipped ${stat._fullPath}`);
    return found;
  }
  const { opts } = ctx;
  const routes = await loadRouteModule(ctx, stat);
  //console.log("--------------------------------------------------")

  for(let i = 0; i < routes.length; i++){
    const route = routes[i];
    if(route?.__ihandler == 'imount'){
      found.imount++;
      if(opts.logging?.mount)
        console.log(`[KernelJs] ~ IMount: ${stat._location}`);
      route(ctx, stat);
    }else if(route?.__ihandler == 'isocketmount'){
      found.isocketmount++;
      await addISocketMount(ctx, stat, route);
    }else if(route?.__ihandler == 'ijob'){
      found.ijob++;
      await addIJobRoute(ctx, stat, route);
    }
  }
  for(let i = 0; i < routes.length; i++){
    const route = routes[i];
    if(route?.__ihandler == 'ihttp'){
      found.ihttp++;
      await addIHttpRoute(ctx, stat.router, stat, route);
    }else if(route?.__ihandler == 'isocket'){
      found.isocket++;
      await addISocketRoute(ctx, stat, route);
    }else if(route?.__ihandler == 'icore'){
      found.icore++;
      await addICoreRoute(ctx, stat, route);
    } else{
      found.icom++;
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


