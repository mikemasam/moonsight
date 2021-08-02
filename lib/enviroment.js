export default async (ctx, opts) => {
  return {
    ...ctx,
    opts: {
      ...ctx.opts,
      ...opts,
      logging: {
        ...ctx.opts.logging,
        ...opts.logging
      }
    }
  }
}
