import fs from 'fs';
import path from 'path';
import { Router } from 'express';
import { NotFound, EmptyResponse, UnhandledReponse } from './../responders/index.js';


export default async function HttpRouter(ctx) {
  //__dirname + '/'
  const { net, opts } = ctx;
  if(opts.apiPath){
    if(!fs.existsSync(opts.apiPath)) throw `Invalid Route path [api] = ${opts.apiPath}.`;
    const root = Router()
    await loadRoutes(ctx, opts.apiPath, root, `/${opts.mount}`);
    net.app.use(`/${opts.mount}`, root);
    const notFoundRoot = await notFoundRouter(ctx);
    net.app.use(`*`, notFoundRoot);
  }
  return ctx;
}

const loadRoutes = async (ctx, directory, router, location) => {
  //if(!fs.existsSync(path)) throw `Invalid Route path ${path}.`;

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
  const { opts } = ctx;
  const root = Router()
  await loadRoutes(ctx, stat._fullPath, root, stat._location);
  const endpoint = await cleanRoutePath(stat._file);
  if(opts.logging?.http)
    console.log(`[Router] ~ ${stat._location}`, endpoint);
  router.use(`/${endpoint}`,root);
}

const addRoute = async (ctx, router, stat) => {
  if(!stat._file.match(/\.js$/)) {
    console.log(`route skipped ${stat._fullPath}`);
    return;
  }
  const handler = await loadRouteModule(ctx, stat);
  const endpoint = await cleanRoutePath(stat._file);
  router.all(`/${endpoint}`, handler);
}

const cleanRoutePath = async (file) => {
  if(file == 'index.js') return '';
  //if(file == '404.js') return '*';
  return file.replace('.js', '').replace('[', ':').replace(']', '');
}

const loadRouteModule = async (ctx, stat) => {
  const AsyncFn = (async () => {}).constructor;
  const module = await import(stat._fullPath);
  if(module?.default instanceof AsyncFn !== true) 
    throw `${stat._fullPath} route doesn't export default function.`;
  const handler = await module.default(ctx);
  if(handler instanceof AsyncFn !== true) 
    throw `${fullPath} route doesn't return async handler function.`;
  return routeHandler(ctx, handler, stat);
}

const notFoundRouter = async (ctx) => {
  return routeHandler(ctx, async () => NotFound(), { _location: '/' })
}

const routeHandler = async (ctx, handler, stat) => {
  return (req, res) => {
    const log = {
      path: stat._location,
      ctx,
      startTime: Date.now(),
    };
    handler(req, res)
      .then(_r => _r?.responder ? _r : EmptyResponse())
      .catch(err => UnhandledReponse(err))
      .then(_r => _r(log, req, res));
  }
}
