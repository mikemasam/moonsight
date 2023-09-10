import { AppContext, AppContextOptsLogging } from "./context";

export interface Logger {
  kernel: (...args: any[]) => void;
  job: (...args: any[]) => void;
  byType: (logType: string, ...args: any[]) => boolean;
  byTypes: (logType: string[], ...args: any[]) => void;
  panic: (e: any) => never;
  handledExeception: (e: any) => void;
}

const logger: Logger = {
  kernel: (...args) => {
    logger.byType("kernel", ...args);
  },
  job: (...args) => {
    logger.byType("job", ...args);
  },
  byType: (logType: string, ...args): boolean => {
    let date = new Date().toLocaleString();
    const context = global.deba_kernel_ctx as AppContext;
    //console.log(`[$app:$type] $log $date`);
    const opts = context.opts.logging as Record<string, boolean>;
    const logging = context.opts.logging;
    let valid = logging.all;
    valid = valid && opts[logType] !== false;
    valid = valid || opts[logType];
    if (!valid) return false;
    if (logging.format == "simple") {
      console.log(`${logType}>`, ...args);
    } else {
      const format = `#[${date}][KernelJs:${logType}]`;
      console.log(format, ...args);
    }
    return true;
  },
  byTypes: (logTypes: string[], ...args) => {
    for (const _t of logTypes) {
      if (logger.byType(_t, ...args)) break;
    }
  },
  panic: (e: any) => {
    console.log("PANIC!!!!", e);
    process.exit(0);
  },
  handledExeception: (e: any) => {
    console.log("ERRORED!!!!", e);
  },
};

export default logger;
