"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger = {
    kernel: (...args) => {
        logger.byType("kernel", ...args);
    },
    job: (...args) => {
        logger.byType("job", ...args);
    },
    byType: (logType, ...args) => {
        let date = new Date().toLocaleString();
        const context = global.deba_kernel_ctx;
        //console.log(`[$app:$type] $log $date`);
        const opts = context.opts.logging;
        const logging = context.opts.logging;
        let valid = logging.all;
        valid = valid && opts[logType] !== false;
        valid = valid || opts[logType];
        if (!valid)
            return false;
        if (logging.format == "simple") {
            console.log(`${logType}>`, ...args);
        }
        else {
            const format = `#[${date}][KernelJs:${logType}]`;
            console.log(format, ...args);
        }
        return true;
    },
    byTypes: (logTypes, ...args) => {
        for (const _t of logTypes) {
            if (logger.byType(_t, ...args))
                break;
        }
    },
    panic: (e) => {
        console.log("PANIC!!!!", e);
        process.exit(0);
    },
    handledExeception: (e) => {
        console.log("ERRORED!!!!", e);
    },
};
exports.default = logger;
