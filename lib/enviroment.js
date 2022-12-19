import logger from './logger.js';
export default async (ctx, opts) => {
  if(!opts.mountCore) opts.mountCore = { mount: false };
  if(!process.env.npm_package_version) 
    throw "Invalid Version number package.json";
  if(opts.version) throw "Version is set in package.json";
  opts.version = process.env.npm_package_version;
  if(opts.coreHost && opts.mountCore.mount) 
    throw "[KernelJs] ~ Kernel failed to start, [coreMount and coreHost] only one is required.";
  if(!opts.channelName) 
    throw "[KernelJs] ~ Kernel failed to start, channelName is required.";
  if(!opts.redis) 
    throw "[KernelJs] ~ Kernel failed to start, redis config is required.";
  if(!opts.port) 
    throw "[KernelJs] ~ Kernel failed to start, port is required.";
  if(!opts.settings) opts.settings = {};
  if(!opts.nodeIdentity || isNaN(opts.nodeIdentity) || String(opts.nodeIdentity).length != 3) 
    throw "[KernelJs] ~ Kernel failed to start, nodeIdentity is required [0-9]{3}.";
  if(opts.autoBoot) ctx.autoBoot = opts.autoBoot;
  if(opts.mocking) ctx.mocking = opts.mocking;
  if(!opts.host) opts.host = 'localhost'
  opts.host = `${opts.host}:${opts.port}`;
  ctx.opts = { 
    ...ctx.opts, 
    ...opts,
    logging: {
      ...ctx.opts.logging,
      ...opts.logging
    }
  };
  ctx.cleanup = AppCleanup();
  return ctx;
}

function AppCleanup(){
  const cleanups = [];
  const add = (name, action) => {
    cleanups.push({ name, action });
  }
  const dispose = () => {
    for(let i = 0; i < cleanups.length; i++){
      const cl = cleanups[i];
      Promise.resolve(cl.action())
        .then(() => {
          logger.kernel(`cleaning up ${cl.name}`);
        })
        .catch(er => {
          logger.kernel(`cleaning up ${cl.name} - Error ${er}`);
        });
    }
  }
  return {
    add,
    dispose
  }
}
