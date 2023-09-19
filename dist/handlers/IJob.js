"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppState_1 = __importDefault(require("../lib/AppState"));
const context_1 = require("../lib/context");
const events_1 = __importDefault(require("../lib/events"));
const logger_1 = __importDefault(require("../lib/logger"));
const AsyncFn = (async () => null).constructor;
function IJob(handler, opts, args) {
    function IJobHandler(stat, name) {
        if (handler instanceof AsyncFn !== true)
            throw `[KernelJs] ~ ${stat.fullPath} IJob async handler function is required.`;
        const jobstate = {
            expected: 15,
            failed: 0,
            name: name,
        };
        const onResult = (result) => {
            if (result == undefined || result == IJob.OK || result == IJob.EMPTY) {
                jobstate.expected = opts.seconds || IJob.BACKOFF;
            }
            else if (result == IJob.FAILED || result == IJob._ERRORED) {
                jobstate.failed++;
                jobstate.expected = IJob.BACKOFF;
            }
            else if (result == IJob.CONTINUE) {
                jobstate.expected = opts.seconds || IJob.BACKOFF;
                runJob(handler, {}, jobstate).then(onResult);
            }
            else if (result > 0) {
                jobstate.expected = result;
            }
            else {
                jobstate.expected = opts.seconds || IJob.BACKOFF;
            }
        };
        events_1.default.once("kernel.corenet.ready", () => {
            if (opts.instant)
                runJob(handler, args || {}, jobstate).then(onResult);
        });
        events_1.default.on("kernel.heartbeat", () => {
            if (jobstate.expected > 0)
                jobstate.expected--;
            else {
                jobstate.expected = opts.seconds || IJob.BACKOFF;
                runJob(handler, args || {}, jobstate).then(onResult);
            }
        });
        events_1.default.on(`kernel.jobs.run.${name}`, (job_name, job_args) => {
            runJob(handler, job_args || {}, jobstate).then(onResult);
        });
    }
    IJobHandler.__ihandler = "ijob";
    return IJobHandler;
}
exports.default = IJob;
IJob.CONTINUE = 1;
IJob.OK = 10;
IJob.BACKOFF = 60;
IJob.EMPTY = -1;
IJob.BUSY = -2;
IJob.FAILED = -3;
IJob._ERRORED = -4;
const runJob = async (handler, args, jobstate) => {
    if ((0, context_1.getContext)().state.corenetReady === false) {
        logger_1.default.job("corenet not ready");
        return parseResponse(IJob.BUSY, 0, jobstate);
    }
    const lock = await (0, context_1.getContext)().queue.aquire(jobstate.name, { wait: false });
    if (!lock)
        return parseResponse(IJob.BUSY, 0, jobstate);
    (0, context_1.getContext)().state.count++;
    logger_1.default.job("JOB RUNNING :", name);
    const res = await handler((0, AppState_1.default)(), args).catch((err) => {
        logger_1.default.job("JOB ERRORED :", name, err);
        return [IJob._ERRORED, err];
    });
    (0, context_1.getContext)().state.count--;
    const lockTime = await lock.clear();
    return parseResponse(res, lockTime, jobstate);
};
const parseResponse = async (res, lockTime, jobstate) => {
    const [result, message] = Array.isArray(res) ? res : [res, ""];
    const msg = message ? `+ {${message}} ${lockTime}ms` : `+ ${lockTime}ms`;
    const prt_logs = [`<${jobstate.name}>`, msg];
    if (result == IJob.FAILED) {
        logger_1.default.job(`JOB FAILED (${jobstate.failed})`, ...prt_logs);
    }
    if (result == IJob._ERRORED) {
        logger_1.default.job(`JOB ERRORED (${jobstate.failed})`, ...prt_logs);
    }
    if (result == IJob.EMPTY)
        logger_1.default.job("JOB EMPTY", ...prt_logs);
    else if (result == IJob.OK)
        logger_1.default.job("JOB OK [SNAIL]", ...prt_logs);
    else if (result == IJob.CONTINUE)
        logger_1.default.job("JOB NEXT [DONE]", ...prt_logs);
    else if (result == IJob.BUSY)
        logger_1.default.job("JOB BUSY", ...prt_logs);
    else if (result == IJob.FAILED) {
    }
    else if (result == IJob._ERRORED) {
    }
    else
        logger_1.default.job("JOB OK(s)", ...prt_logs);
    return result;
};
