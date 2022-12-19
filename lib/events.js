import EventEmitter from 'events';


export default async function SystemEvents(ctx){
  const events = new EventEmitter();
  events.setMaxListeners(ctx.opts.maxListeners || 20);
  const heartbeat = setInterval(() => {
    events.emit("kernel.internal.heartbeat", {});
    if(ctx.ready) events.emit("kernel.heartbeat", {});
  }, 1000);
  events.on("kernel.ready", (fromW) => {
    ctx.state.timeout = ctx.opts.shutdownTimeout
    if(ctx.ready === undefined) ctx.ready = true;
    //else shutdownKernel();
  });
  const testReady = () => {
    if(!ctx.state.redisReady) return;
    if(!ctx.state.httpReady) return;
    if(ctx.ready === undefined) events.emit("kernel.ready", "form test");
  }
  events.on("kernel.internal.redis.ready", () => {
    ctx.state.redisReady = true;
    events.emit("kernel.redis.ready");
    testReady();
  });
  events.on("kernel.internal.http.ready", () => {
    ctx.state.httpReady = true;
    events.emit("kernel.http.ready");
    testReady();
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
      if(!process.env.JEST_WORKER_ID) process.exit(0);
    }else if(ctx.state.shutdown) {
      ctx.state.timeout--;
    }
  }
  events.on("kernel.internal.heartbeat", () => {
    shutdownKernel()
  });

  ['SIGINT', 'SIGTERM'].forEach(evt => process.on(evt, () => {
    if(ctx.ready) console.log("[KernelJs] ~ waiting for services...."); 
    if(ctx.ready) ctx.cleanup.dispose();
    ctx.ready = false;
    ctx.state.shutdown = true;
    shutdownKernel()
  }));

  ctx.events = events;
  ctx.cleanup.add("Events", () => {
    ctx.ready = false;
    ctx.state.shutdown = true;
    clearInterval(heartbeat)
  });
  return ctx;
}
