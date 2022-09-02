import { AppState } from '../responders/index.js';
export default function IJob(handler, opts, args){
  const AsyncFn = (async () => {}).constructor;
  if(handler instanceof AsyncFn !== true) 
    throw `[Router] ~ ${stat._fullPath} IJob async handler function is required.`;
  function IJobHandler(ctx, stat, name){
    const jobstate = {
      expected: 10
    };
    const onResult = (result) => {
      if(result == IJob.OK){
        jobstate.expected = opts.seconds;
      }else{
        jobstate.expected = result;
      }
    }
    ctx.events.once("kernel.ready", () => {
      if(opts.instant)
        runJob(handler, ctx, name, args || {}).then(onResult);
    });
    ctx.events.on("kernel.heartbeat", () => {
      if(jobstate.expected > 0) jobstate.expected--;
      else {
        runJob(handler, ctx, name, args || {}).then(onResult);
      }
    });
    ctx.events.on("kernel.jobs.run", (job_name, job_args) => {
      if(job_name == name) {
        runJob(handler, ctx, name, job_args || {}).then(onResult);
      }
    });
  };
  IJobHandler.__ihandler = 'ijob';
  return IJobHandler;
}
IJob.CONTINUE = 1;
IJob.OK = 10;
IJob.BACKOFF = 60;

const runJob = async (handler, ctx, name, args) => {
  const lock = await ctx.queue.aquire(name, { wait: false })
  if(!lock) {
    if(ctx.opts.logging.job)
      console.log("[KernelJs] ~ scheduled job superceded:", name);
    return IJob.OK;
  }
  if(ctx.opts.logging.job)
    console.log("[KernelJs] ~ running job:", name);
  const result = await handler(AppState(ctx), args).catch(err => {
    console.log("[KernelJs] ~ Error occured", err);
    return IJob.OK;
  });
  lock.clear();
  return result;
}
