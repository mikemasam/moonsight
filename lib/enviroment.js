export default async (ctx, opts) => {

  if(opts.coreHost && opts.mountCore) 
    throw "[KernelJs] ~ Kernel failed to start, [coreMount and coreHost] only one is required.";
  if(!opts.channelName) 
    throw "[KernelJs] ~ Kernel failed to start, channelName is required.";
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
