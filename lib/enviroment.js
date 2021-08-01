import { config } from 'dotenv'
export default async (ctx, opts) => {
  config();
  //console.log(process.env);
  return {
    ...ctx,
    opts: {
      ...ctx.opts,
      port: opts.port,
      api: opts.apiPath
    }
  }
}
