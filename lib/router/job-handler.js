
export const addIJobRoute = async (ctx, stat, ijob) => {
  const endpoint = await cleanRoutePath(stat._location);
  if(ctx.opts.logging?.job)
    console.log(`[KernelJs] ~ IJob: ${stat._location}`, endpoint);
  ijob(ctx, stat, endpoint);
}
//console.log(handler);

const cleanRoutePath = async (file) => {
  return file.replace('/index.js', '').replace('.js', '').split('/').join(':');
}
