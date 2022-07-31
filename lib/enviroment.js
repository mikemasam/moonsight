export default async (ctx, opts) => {

  if(!opts.mountCore) opts.mountCore = { mount: false };
  if(opts.coreHost && opts.mountCore.mount) 
    throw "[KernelJs] ~ Kernel failed to start, [coreMount and coreHost] only one is required.";
  if(!opts.channelName) 
    throw "[KernelJs] ~ Kernel failed to start, channelName is required.";
  if(!opts.settings) opts.settings = {};
  ctx.opts = { 
    ...ctx.opts, 
    ...opts,
    logging: {
      ...ctx.opts.logging,
      ...opts.logging
    }
  };
  return ctx;
}
