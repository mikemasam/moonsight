export default async (ctx, opts) => {
  return {
    ...ctx,
    opts: {
      ...ctx.opts,
      port: opts.port,
      api: opts.apiPath
    }
  }
}
