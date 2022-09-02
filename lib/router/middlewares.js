import fs from 'fs';
import path from 'path';

const AsyncFn = (async () => {}).constructor;
export const loadMiddlewares = async (ctx, location) => {
  if(!location) return [];
  if(!fs.existsSync(`${location}`)) 
    throw `[KernelJs] ~ Invalid Middleware location ${location}.`;
  const middlewares = await getMiddlewares(location);;
  return middlewares;
}

const getMiddlewares = async (directory) => {
  const routes = fs.readdirSync(directory).map(file => {
    const fullPath = path.join(directory, file);
    const stat = fs.statSync(fullPath);
    stat._file = file;
    stat._fullPath = fullPath;
    return stat;
  });
  const nested = await Promise.all(routes.filter(r => r.isDirectory()).map(async (stat) => {
    return getMiddlewares(stat._fillPath);
  }));

  const current = await Promise.all(routes.filter(r => r.isFile()).map(async (stat) => {
    const action = await loadMiddleware(stat._fullPath);
    return {
      name: cleanName(stat._file),
      action
    };
  }));
  return [...nested, ...current];
}

const loadMiddleware = async (location) => {
  const module = await import(`${location}`);
  if(module.default instanceof AsyncFn !== true) 
    throw `[KernelJs] ~ ${location} middleware doesn't return async handler function.`;
  return module.default;
}

const cleanName = (file) => {
  return file.replace('.js', '');
}
