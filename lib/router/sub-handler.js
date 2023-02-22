
export const addISubRoute = async (ctx, stat, isub) => {
  const endpoint = await cleanRoutePath(stat._location);
  if(ctx.opts.logging?.sub)
    console.log(`[KernelJs] ~ ISub: ${stat._location}`, endpoint);
  await isub(ctx, stat, endpoint);
}
//console.log(handler);

const cleanRoutePath = async (file) => {
  return file.replace('/index.js', '').replace('.js', '').split('/').join(':');
}
