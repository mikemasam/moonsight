import EventEmitter from 'events';


export default async function SystemEvents(ctx){
  const events = new EventEmitter();
  setInterval(() => {
    events.emit("kernel.internal.heartbeat", {});
    if(ctx.ready) events.emit("kernel.heartbeat", {});
  }, 1000);
  events.on("kernel.ready", () => {
    ctx.state.timeout = ctx.opts.shutdownTimeout
    if(ctx.ready === undefined) ctx.ready = true;
    else shutdownKernel();
  });
  events.on("kernel.internal.corenet.ready", () => {
    ctx.state.corenetReady = true;
    events.emit("kernel.corenet.ready");
  });

  const shutdownKernel = () => {
    if(ctx.opts.logging.kernel)
      console.log(`[KernelJs] ~ State Count: ${ctx.state.count}`);
    if(ctx.state.shutdown && (ctx.state.count <= 0 || ctx.state.timeout <= 0)){
      console.log("[KernelJs] ~ -_-"); 
      process.exit();
    }else if(ctx.state.shutdown) {
      ctx.state.timeout--;
    }
  }
  events.on("kernel.internal.heartbeat", () => {
    shutdownKernel()
  });

  ['SIGINT', 'SIGTERM'].forEach(evt => process.on(evt, () => {
    if(ctx.ready)
      console.log("[KernelJs] ~ waiting for services...."); 
    ctx.ready = false;
    ctx.state.shutdown = true;
    shutdownKernel()
  }));

  ctx.events = events;
  return ctx;
}
