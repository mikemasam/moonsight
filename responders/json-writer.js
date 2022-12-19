export default (data = {}, logs = {}, rawData = {}) => {
  async function ReponseWriter (log, req, res){
    //TODO: use locals:_lifetime for context & stat & startTime
    if(!log || !req) throw "Response writer missing required argument.";
    if(!data) data = {};

    if(res.__locals){
      let hooks = res.__locals.hooks.reverse();
      while(hooks.length){
        const hook = hooks.pop();
        const changes = await hook(rawData);
        data = {
          ...data,
          ...changes
        }
      }
    }

    if(data?.success !== undefined)
      throw "Response writer is using [success] param for client status check, remove the parameter";
    if(!isString(data.message)) data.message = "Result";
    log.method =  req.method;
    log.ip = req.ip;
    log.url = req.originalUrl;
    log.status = data.status || 0;
    log.endTime = Date.now();
    logRequest({ ...log, ...logs});
    if(data?.status === 0) return;

    if(res?.json){
      res.json({ ...data, success: data?.status == 200 });
    } else if(res && res.fn){
      res.fn({ ...data, success: data?.status == 200 });
    }
  };
  ReponseWriter.responder = true;
  return ReponseWriter;
}

const logRequest = async (log) => {
  //console.log(log);
  const opts = log.opts || log.ctx?.opts;
  const date = Date(log.startTime).toString();
  if(opts.logging?.http || opts.logging?.networking)
    console.log(`[${date.slice(0, date.lastIndexOf(':') + 3)}] ${log.method} ${log.url} ~ ${log.path} ${log.status} ${log.endTime - log.startTime}ms`);
  if((opts.logging?.error || opts.logging?.networking) && log.err) 
    console.error(`[Exception] ~ ${log.method} ${log.url} `, log.err);
}


function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}


