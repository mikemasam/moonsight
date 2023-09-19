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
        const context = global.deba_kernel_ctx;
        if (context.opts.logging.all) {
            console.log(`[KernelJs:${logType}]`, ...args);
        }
        else if (context.opts.logging[logType]) {
            console.log(`[KernelJs:${logType}]`, ...args);
        }
    },
    byTypes: (logTypes, ...args) => {
        logTypes.map((_t) => logger.byType(_t, ...args));
    },
    panic: (e) => {
        console.log("PANIC!!!!", e);
    },
    handledExeception: (e) => {
        console.log("ERRORED!!!!", e);
    },
};
exports.default = logger;
