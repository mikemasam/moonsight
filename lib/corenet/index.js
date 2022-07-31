import CoreNetSelector from './net.js';
const CoreNet = new CoreNetSelector();
export default async (ctx) => {
  //console.log(ctx.opts);
  const { mountCore, coreHost } = ctx.opts;
  if(coreHost){
    ctx.net.coreNet = CoreNet.connectRemote(ctx);
  }else if(mountCore.mount){
    ctx.net.coreNet = CoreNet.connectLocal(ctx);
  }
  return ctx;
}

export {
  CoreNet
}

