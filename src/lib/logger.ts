import { AppContext } from "./context";

export interface TAppLogger {
  log: (type: string, ...args: any[]) => void;
}

export const AppLogger: TAppLogger = {
  log: (type: string, ...args: any[]) => {
    if (!logger.opts()?.["app"]) return;
    const appl: any = logger.opts()["app"];
    if (appl[type]) {
      logger.byType("app", `[${type}]`, ...args);
    }
  },
};
export interface Logger {
  opts: () => Record<string, boolean | string | Record<string, boolean>>;
  kernel: (...args: any[]) => void;
  job: (...args: any[]) => void;
  byType: (logType: string, ...args: any[]) => boolean;
  byTypes: (logType: string[], ...args: any[]) => void;
  panic: (e: any) => never;
  handledExeception: (e: any) => void;
}

const logger: Logger = {
  opts: () => {
    const context = global.deba_kernel_ctx as AppContext;
    return context.opts.logging as Record<
      string,
      boolean | string | Record<string, boolean>
    >;
  },
  kernel: (...args) => {
    logger.byType("kernel", ...args);
  },
  job: (...args) => {
    logger.byType("job", ...args);
  },
  byType: (logType: string, ...args): boolean => {
    let date = new Date().toLocaleString();
    const opts = logger.opts();
    let valid = opts.all;
    valid = valid && opts[logType] !== false;
    valid = valid || opts[logType];
    if (!valid) return false;
    if (opts.format == "simple") {
      console.log(`${limitString(logType, 10)}>`, ...args);
    } else {
      const format = `#[${date}][KernelJs:${limitString(logType, 10)}]`;
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

const limitString = (str: string, maxLength: number) =>
  str.length <= maxLength
    ? str.padEnd(maxLength, "-")
    : str.substring(0, maxLength - 3) + "...";
export default logger;
