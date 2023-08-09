import { RequestLog, ResponseLog, RouteLog } from "../handlers/BaseHander";
import logger from "../lib/logger";

export default async function logRequest(
  req_log: RequestLog,
  res_log: ResponseLog,
  app_log: RouteLog
) {
  let date = Date().toString();
  date = date.slice(0, date.lastIndexOf(":") + 3);
  const logTypes = ["http", "networking"];
  const reqName = `${res_log.method} ${res_log.url} ~ ${req_log.path}`;
  const reqMs = res_log.endTime - req_log.startTime;
  if (!app_log.err) {
    logger.byTypes(
      logTypes,
      `[${date}]  ${reqName} ${res_log.status} ${reqMs}ms`
    );
  } else if (app_log.err)
    logger.byTypes(logTypes, `[Exception] ~ ${reqName}  `, app_log.err);
}
