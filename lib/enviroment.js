export default async (ctx, opts) => {
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
