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
    console.log("[KernelJs]", ...args);
  }
}

export default logger;
