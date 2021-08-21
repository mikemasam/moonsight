export default (data = {}, logs = {}) => {
  async function ReponseWriter (log, req, res){
    if(!log || !req) throw "Response writer missing required argument.";
    if(!data) data = {};
    if(data?.success !== undefined) throw "Response writer is using [success] param for client status check, remove the parameter";
    if(!isString(data.message)) data.message = "Result";
      log.method =  req.method;
    log.ip = req.ip;
    log.url = req.originalUrl;
    log.status = data.status || 0;
    log.endTime = Date.now();
    logRequest({ ...log, ...logs});
    if(res.json){
      res.json({ ...data, success: data?.status == 200 });
    }
    else if(res && res.fn){
      res.fn({ ...data, success: data?.status == 200 });
    }
  };
  ReponseWriter.responder = true;
  return ReponseWriter;
}

const logRequest = async (log) => {
  //console.log(log);
  const { opts } = log.ctx;
  const date = Date(log.startTime).toString();
  if(opts.logging?.http)
    console.log(`[${date.slice(0, date.lastIndexOf(':') + 3)}] ${log.method} ${log.url} ~ ${log.path} ${log.status} ${log.endTime - log.startTime}ms`);
  if(opts.logging?.error && log.err) console.error(`[Exception] ~ ${log.method} ${log.url} `, log.err);
}


function isString(x) {
  return Object.prototype.toString.call(x) === "[object String]"
}
