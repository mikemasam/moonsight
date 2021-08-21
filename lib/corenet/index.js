import CoreNetSelector from './net.js';
const CoreNet = new CoreNetSelector();
export default async (ctx) => {
  //console.log(ctx.opts);
  const { coreHost } = ctx.opts;
  if(coreHost){
    ctx.net.coreNet = CoreNet.init(ctx);
  }
  return ctx;
}

export {
  CoreNet
}

