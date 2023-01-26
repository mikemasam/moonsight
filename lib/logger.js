const logger = {};
logger.kernel = (...args) => {
  logger.byType('kernel', ...args);
  //  if(global.deba_kernel_ctx.opts.logging.kernel){
  //    console.log("[KernelJs:Sys]", ...args);
  //  }
}
logger.job = (...args) => {
  logger.byType('job', ...args);
  //  if(global.deba_kernel_ctx.opts.logging.job){
  //    console.log("[KernelJs:Job]", ...args);
  //  }
}
logger.byType = (logType, ...args) => {
  if(global.deba_kernel_ctx.opts.logging.all){
    console.log(`[KernelJs:${logType}]`, ...args);
  }else if(global.deba_kernel_ctx.opts.logging[logType]){
    console.log(`[KernelJs:${logType}]`, ...args);
  }
}

export default logger;
