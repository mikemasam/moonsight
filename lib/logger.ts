import { AppContext } from "./context";

export interface Logger {
  kernel: (...args: any[]) => void;
  job: (...args: any[]) => void;
  byType: (logType: string, ...args: any[]) => void;
  byTypes: (logType: string[], ...args: any[]) => void;
  panic: (e: any) => void;
  handledExeception: (e: any) => void;
}

const logger: Logger = {
  kernel: (...args) => {
    logger.byType("kernel", ...args);
  },
  job: (...args) => {
    logger.byType("job", ...args);
  },
  byType: (logType, ...args) => {
    const context = global.deba_kernel_ctx as AppContext;
    if (context.opts.logging.all) {
      console.log(`[KernelJs:${logType}]`, ...args);
    } else if (context.opts.logging[logType]) {
      console.log(`[KernelJs:${logType}]`, ...args);
    }
  },
  byTypes: (logTypes: string[], ...args) => {
    logTypes.map((_t) => logger.byType(_t, ...args));
  },
  panic: (e: any) => {
    console.log("PANIC!!!!", e);
  },
  handledExeception: (e: any) => {
    console.log("ERRORED!!!!", e);
  },
};

export default logger;
