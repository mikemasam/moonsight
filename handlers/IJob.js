import { AppState } from '../responders/index.js';
export default function IJob(handler, opts, args){
  const AsyncFn = (async () => {}).constructor;
  if(handler instanceof AsyncFn !== true) 
    throw `[KernelJs] ~ ${stat._fullPath} IJob async handler function is required.`;
  function IJobHandler(ctx, stat, name){
    const jobstate = {
      expected: 10
    };
    const onResult = (result) => {
      if(ctx.opts.logging.job){
        if(result == IJob.EMPTY)
          console.log("[KernelJs] ~ JOB EMPTY:", name);
        else if(result == IJob.OK)
          console.log("[KernelJs] ~ JOB OK [SNAIL]:", name);
        else if(result == IJob.CONTINUE)
          console.log("[KernelJs] ~ JOB NEXT:", name);
        else if(result == IJob.BUSY)
          console.log("[KernelJs] ~ JOB BUSY:", name);
        else console.log("[KernelJs] ~ JOB OK(s):", name, result);
      }

      if(result == undefined || result == IJob.OK || result == IJob.EMPTY){
        jobstate.expected = opts.seconds || IJob.BACKOFF;
      }else if(result > 0){
        jobstate.expected = result;
      }else{
        jobstate.expected = opts.seconds || IJob.BACKOFF;
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
IJob.EMPTY = -1;
IJob.BUSY = -2;

const runJob = async (handler, ctx, name, args) => {
  const lock = await ctx.queue.aquire(name, { wait: false })
  if(!lock) return IJob.BUSY;
  if(ctx.opts.logging.job)
    console.log("[KernelJs] ~ JOB RUNNING :", name);
  const result = await handler(AppState(ctx), args).catch(err => {
    console.log("[KernelJs] ~ JOB ERRORED :", name, err);
    return IJob.OK;
  });
  lock.clear();
  return result;
}
