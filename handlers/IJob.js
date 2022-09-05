import { AppState } from '../responders/index.js';
export default function IJob(handler, opts, args){
  const AsyncFn = (async () => {}).constructor;
  function IJobHandler(ctx, stat, name){
    if(handler instanceof AsyncFn !== true) 
      throw `[KernelJs] ~ ${stat._fullPath} IJob async handler function is required.`;
    const jobstate = { expected: 15, failed: 0, name: name };
    const onResult = (result) => {
      if(result == undefined || result == IJob.OK || result == IJob.EMPTY){
        jobstate.expected = opts.seconds || IJob.BACKOFF;
      }else if(result == IJob.FAILED || result == IJob._ERRORED){
        jobstate.failed++;
        jobstate.expected = IJob.BACKOFF;
      }else if(result == IJob.CONTINUE){
        jobstate.expected = opts.seconds || IJob.BACKOFF;
        runJob(handler, ctx, {}, jobstate).then(onResult);
      }else if(result > 0){
        jobstate.expected = result;
      }else{
        jobstate.expected = opts.seconds || IJob.BACKOFF;
      }
    }
    ctx.events.once("kernel.corenet.ready", () => {
      if(opts.instant)
        runJob(handler, ctx, args || {}, jobstate).then(onResult);
    });
    ctx.events.on("kernel.heartbeat", () => {
      if(jobstate.expected > 0) jobstate.expected--;
      else {
        jobstate.expected = opts.seconds || IJob.BACKOFF;
        runJob(handler, ctx, args || {}, jobstate).then(onResult);
      }
    });
    ctx.events.on(`kernel.jobs.run.${name}`, (job_name, job_args) => {
      runJob(handler, ctx, job_args || {}, jobstate).then(onResult);
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
IJob.FAILED = -3;
IJob._ERRORED = -4;

const runJob = async (handler, ctx, args, jobstate) => {
  if(ctx.state.corenetReady === false){
    console.log("corenet not ready");
    return parseResponse(ctx.opts, IJob.BUSY, 0, jobstate);
  }
  const lock = await ctx.queue.aquire(jobstate.name, { wait: false })
  if(!lock) return parseResponse(ctx.opts, IJob.BUSY, 0, jobstate);
  ctx.state.count++;
  //  if(ctx.opts.logging.job)
  //    console.log("[KernelJs] ~ JOB RUNNING :", name);
  const res = await handler(AppState(ctx), args).catch(err => {
    //console.log("[KernelJs] ~ JOB ERRORED :", jobstate.name, err);
    return [IJob._ERRORED, err];
  });
  ctx.state.count--;
  const lockTime = await lock.clear();
  return parseResponse(ctx.opts, res, lockTime, jobstate);
}

const parseResponse = async (ctx_opts, res, lockTime, jobstate) => {
  const [result, message] = Array.isArray(res) ? res : [res, ''];
  const msg = message ? `+ {${message}} ${lockTime}ms` : `+ ${lockTime}ms`;
  const prt_logs = [`<${jobstate.name}>`, msg];
  if(result == IJob.FAILED) {
    console.log(`[KernelJs] ~ JOB FAILED (${jobstate.failed})`, ...prt_logs);
  }
  if(result == IJob._ERRORED) {
    console.log(`[KernelJs] ~ JOB ERRORED (${jobstate.failed})`, ...prt_logs);
  }
  if(ctx_opts.logging.job){
    if(result == IJob.EMPTY)
      console.log("[KernelJs] ~ JOB EMPTY", ...prt_logs);
    else if(result == IJob.OK)
      console.log("[KernelJs] ~ JOB OK [SNAIL]", ...prt_logs);
    else if(result == IJob.CONTINUE)
      console.log("[KernelJs] ~ JOB NEXT [DONE]", ...prt_logs);
    else if(result == IJob.BUSY)
      console.log("[KernelJs] ~ JOB BUSY", ...prt_logs);
    else if(result == IJob.FAILED) {}
    else if(result == IJob._ERRORED) {}
    else console.log("[KernelJs] ~ JOB OK(s)", ...prt_logs);
  }
  return result;
};
