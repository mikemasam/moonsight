const logger = {};
logger.kernel = (...args) => {
  if(global.deba_kernel_ctx.opts.logging.kernel){
    console.log("[KernelJs:Sys]", ...args);
  }
}
logger.job = (...args) => {
  if(global.deba_kernel_ctx.opts.logging.job){
    console.log("[KernelJs:Job]", ...args);
  }
}
logger.byType = (logType, ...args) => {
  if(global.deba_kernel_ctx.opts.logging[logType]){
    logType[0] = logType[0].toUpperCase();
    console.log(`[KernelJs:${logType}]`, ...args);
  }
}

export default logger;
