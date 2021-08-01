import fs from 'fs';
import path from 'path';
import { Router } from 'express';


export default async function HttpRouter(ctx) {
  //__dirname + '/'
  const { net, opts } = ctx;
  if(opts.api){
    if(!fs.existsSync(opts.api)) throw `Invalid Route path [api] = ${opts.api}.`;
    const root = Router()
    await loadRoutes(ctx, opts.api, root);
    net.app.use('/api', root);
  }
  return ctx;
}

const loadRoutes = async (ctx, directory, router) => {
  //if(!fs.existsSync(path)) throw `Invalid Route path ${path}.`;
  const routes = fs.readdirSync(directory).map(async (file) => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    //console.log(stat, stat.isDirectory());
    if(stat.isFile()){
      return addRoute(ctx, fullPath, router, file);
    }else if(stat.isDirectory()) {
      return addRouter(ctx, fullPath, router, file);
    }
  });
  return Promise.all(routes);
}

const addRouter = async (ctx, fullPath, router, file) => {
  const root = Router()
  await loadRoutes(ctx, fullPath, root);
  const endpoint = await cleanRoutePath(file);
  console.log(`new router ${fullPath}`, endpoint);
  router.use(`/${endpoint}`,root);
}

const addRoute = async (ctx, fullPath, router, file) => {
  if(!file.match(/\.js$/)) {
    console.log(`route skipped ${fullPath}`);
    return;
  }
  const handler = await loadRouteModule(ctx, fullPath);
  //console.log('handler', handler);
  const endpoint = await cleanRoutePath(file);
  router.all(`/${endpoint}`, handler);
}

const cleanRoutePath = async (file) => {
  if(file == 'index.js') return '';
  return file.replace('.js', '').replace('[', ':').replace(']', '');
}

const loadRouteModule = async (ctx, fullPath) => {
  const AsyncFn = (async () => {}).constructor;
  const module = await import(fullPath);
  if(module?.default instanceof AsyncFn !== true) 
    throw `${fullPath} route doesn't export default function.`;
  const handler = await module.default(ctx);
  if(handler instanceof AsyncFn !== true) 
    throw `${fullPath} route doesn't return async handler function.`;
  return routeHandler(ctx, handler, fullPath);
}

const routeHandler = async (ctx, handler, fullPath) => {
  return (req, res) => {
    const log = {
      ctx,
      method: req.method,
      ip: req.ip,
      url: req.originalUrl,
      status: 0,
      startTime: Date.now(),
    };
    //console.log(`route [${fullPath}]`, );
    handler(req, res).then(response => {
      if(response){
        log.status = response.status;
        res.json(response);
      }else{
        log.status = 204;
        res.json({
          status: 204,
          message: 'Empty response.'
        });
      }
      log.endTime = Date.now();
      return log;
    }).catch(err => {
      res.json({
        status: 500,
        message: 'Unhandled exception occured.'
      });
      log.err = err;
      log.endTime = Date.now();
      log.status = 500;
      return log;
    }).then(logRequest);
  }
}

const logRequest = async (log) => {
  //console.log(log);
  const { opts } = log.ctx;
  const date = Date(log.startTime).toString();
  if(opts.logging?.http)
    console.log(`[${date.slice(0, date.lastIndexOf(':') + 3)}] ${log.method} ${log.url} ${log.status} ${log.endTime - log.startTime}ms`);
  if(opts.logging?.error && log.err) console.log(log.err);
}

/*
date
url
source ip
status

*/
