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
  const module = await import(`../${fullPath}`);
  if(module?.default instanceof AsyncFn !== true) throw `${fullPath} route doesn't export default function.`;
  const handler = await module.default(ctx);
  if(handler instanceof AsyncFn !== true) throw `${fullPath} route doesn't return async handler function.`;
  return routeHandler(ctx, handler, fullPath);
}

const routeHandler = async (ctx, handler, fullPath) => {
  return (req, res) => {
    console.log(`route [${fullPath}]`, );
    handler(req, res).then(response => {
      console.log('\tsuccess');
      res.json(response);
    }).catch(err => {
      console.log('\tfailed', err);
      res.json({
        status: 500,
        message: 'Unhandled exception occured.'
      });
    });
  }
}


