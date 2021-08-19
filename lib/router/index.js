import fs from 'fs';
import path from 'path';
import { Router } from 'express';
const AsyncFn = (async () => {}).constructor;
import { notFoundRouter, addIHttpRoute } from './http-handlers.js';


export default async function HttpRouter(ctx) {
  const { net, opts } = ctx;
  if(opts.apiPath){
    if(!fs.existsSync(opts.apiPath)) 
      throw `[Router] ~ Invalid Route path [api] = ${opts.apiPath}.`;
    const root = Router()
    ctx.net.middlewares = {
      http: await loadMiddlewares(ctx, opts.middlewaresPath)
    }
    await loadRoutes(ctx, opts.apiPath, root, `/${opts.mount}`);
    net.app.use(`/${opts.mount}`, root);
    const notFoundRoot = await notFoundRouter(ctx);
    net.app.use(`*`, notFoundRoot);
  }
  return ctx;
}

const loadMiddlewares = async (ctx, path) => {
  if(!path) return {};
  if(!fs.existsSync(`${path}/index.js`)) 
    throw `[Router] ~ Invalid Middleware path ${path}.`;
  const module = await import(`${path}/index.js`);
  if(module.default instanceof AsyncFn !== true) 
    throw `[Router] ~ ${path} middleware doesn't return async handler function.`;
  return module.default();
}

const loadRoutes = async (ctx, directory, router, location) => {
  const routes = fs.readdirSync(directory).map(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    stat._fullPath = fullPath;
    stat._file = file;
    stat._dir = directory;
    stat._location = `${location}/${file}`;
    return stat;
  });

  await Promise.all(routes.filter(r => r.isDirectory()).map(async (stat) => {
    return addRouter(ctx, router, stat);
  }));

  return Promise.all(routes.filter(r => r.isFile()).map(async (stat) => {
    return addRoute(ctx, router, stat);
  }));
}

const addRouter = async (ctx, router, stat) => {
  if(stat._file == 'components') return;
  const { opts } = ctx;
  const root = Router()
  await loadRoutes(ctx, stat._fullPath, root, stat._location);
  const endpoint = stat._file.replace('[', ':').replace(']', '');
  if(opts.logging?.http)
    console.log(`[Router] ~ ${stat._location}`, endpoint);
  router.use(`/${endpoint}`,root);
}

const addRoute = async (ctx, router, stat) => {
  if(!stat._file.match(/\.js$/)) {
    console.log(`route skipped ${stat._fullPath}`);
    return;
  }
  const [ihttp] = await loadRouteModule(ctx, stat);
  addIHttpRoute(ctx, router, stat, ihttp);
}

const loadRouteModule = async (ctx, stat) => {
  const module = await import(stat._fullPath);
  if(module?.default instanceof AsyncFn === true) module?.default(ctx);
  const ihttp = module.ihttp;
  const isocket = module.isocket;
  const ikernel = module.ikernel;
  return [ihttp, isocket, ikernel];
}


