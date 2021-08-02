export default (data, logs = {}) => {
  async function ReponseWriter (log, req, res){
    res.json(data);
    log.method =  req.method;
    log.ip = req.ip;
    log.url = req.originalUrl;
    log.status = data.status || 0;
    log.endTime = Date.now();
    logRequest({ ...log, ...logs});
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
  if(opts.logging?.error && log.err) console.log(log.err);
}

