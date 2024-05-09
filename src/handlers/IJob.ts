import CreateAppState, { AppState } from "../lib/AppState";
import { getContext } from "../lib/context";
import events from "../lib/events";
import logger from "../lib/logger";
import { makeAsyncHandler } from "../utils/asyncHander";
import { RouteStat } from "./BaseHander";
type JobState = {
  expected: number;
  failed: number;
  name: string;
};
type IJobConfig = {
  seconds?: number;
  instant?: boolean;
};
export default function IJob(
  async_handler: IJobHandler,
  opts: IJobConfig,
  args?: Object,
) {
  const handler = makeAsyncHandler(async_handler);
  function IJobHandler(stat: RouteStat, name: string) {
    const jobstate: JobState = {
      expected: opts.seconds || IJob.BACKOFF,
      failed: 0,
      name: name,
    };
    const onResult = (result: number) => {
      if (result == undefined || result == IJob.OK || result == IJob.EMPTY) {
        jobstate.expected = opts.seconds || IJob.BACKOFF;
      } else if (result == IJob.FAILED || result == IJob._ERRORED) {
        jobstate.failed++;
        jobstate.expected = IJob.BACKOFF;
      } else if (result == IJob.CONTINUE) {
        jobstate.expected = opts.seconds || IJob.BACKOFF;
        runJob(handler, {}, jobstate).then(onResult);
      } else if (result > 0) {
        jobstate.expected = result;
      } else {
        jobstate.expected = opts.seconds || IJob.BACKOFF;
      }
    };

    events.once("kernel.ready", () => {
      if (opts.instant) runJob(handler, args || {}, jobstate).then(onResult);
    });
    events.on("kernel.heartbeat", () => {
      if (jobstate.expected > 0) jobstate.expected--;
      else {
        jobstate.expected = opts.seconds || IJob.BACKOFF;
        runJob(handler, args || {}, jobstate).then(onResult);
      }
    });
    events.on(
      `kernel.jobs.run.${name}`,
      (job_name: string, job_args: Object) => {
        runJob(handler, job_args || {}, jobstate).then(onResult);
      },
    );
  }
  IJobHandler.__ihandler = "ijob";
  return IJobHandler;
}
IJob.CONTINUE = 1;
IJob.OK = 10;
IJob.BACKOFF = 60;
IJob.EMPTY = -1;
IJob.BUSY = -2;
IJob.FAILED = -3;
IJob._ERRORED = -4;

type IJobHandler = (state: AppState, args: Object) => Promise<[number, string]>;
const runJob = async (
  handler: IJobHandler,
  args: Object,
  jobstate: JobState,
) => {
  /*
  if (getContext().state.corenetReady === false) {
    logger.job("corenet not ready");
    return parseResponse(IJob.BUSY, 0, jobstate);
  }
  */
  const lock = await getContext().queue.aquire(jobstate.name, { wait: false });
  if (!lock) return parseResponse(IJob.BUSY, 0, jobstate);
  getContext().state.count++;
  logger.job("JOB RUNNING :", jobstate.name);
  const res: number | [number] | [number, string] = await handler(
    CreateAppState(),
    args,
  ).catch((err) => {
      logger.job("JOB ERRORED :", jobstate.name, err);
      return [IJob._ERRORED, err];
    });
  getContext().state.count--;
  const lockTime = await lock.clear();
  return parseResponse(res, lockTime, jobstate);
};

const parseResponse = async (
  res: [number, string] | number | [number],
  lockTime: number,
  jobstate: JobState,
) => {
  const [result, message] = Array.isArray(res) ? res : [res, ""];
  const msg = message ? `+ {${message}} ${lockTime}ms` : `+ ${lockTime}ms`;
  const prt_logs = [`<${jobstate.name}>`, msg];
  if (result == IJob.FAILED) {
    logger.job(`JOB FAILED (${jobstate.failed})`, ...prt_logs);
  }
  if (result == IJob._ERRORED) {
    logger.job(`JOB ERRORED (${jobstate.failed})`, ...prt_logs);
  }
  if (result == IJob.EMPTY) logger.job("JOB EMPTY", ...prt_logs);
  else if (result == IJob.OK) logger.job("JOB OK [SNAIL]", ...prt_logs);
  else if (result == IJob.CONTINUE) logger.job("JOB NEXT [DONE]", ...prt_logs);
  else if (result == IJob.BUSY) logger.job("JOB BUSY", ...prt_logs);
  else if (result == IJob.FAILED) {
  } else if (result == IJob._ERRORED) {
  } else logger.job("JOB OK(s)", ...prt_logs);
  return result;
};
