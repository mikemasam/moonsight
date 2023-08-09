import {
  HttpResponse,
  NetRequest,
  NetResponse,
  RequestLog,
  ResponseLog,
  RouteLog,
  SocketResponse,
} from "../../handlers/BaseHander";
import logRequest from "../../lib/logRequest";
import AppResponse from "./AppResponse";

export default class JsonResponder {
  private appRes: AppResponse;
  private req: NetRequest;
  private res: NetResponse;
  private req_log: RequestLog;
  private logs: RouteLog = {};
  constructor(
    appRes: AppResponse,
    req_log: RequestLog,
    req: NetRequest,
    res: NetResponse
  ) {
    this.appRes = appRes;
    this.req_log = req_log;
    this.req = req;
    this.res = res;
    this.logs.err = appRes.error;
  }
  async socket() {
    if (this.appRes.status == -1) return;
    await this.postHooks();
    const res_log = this.makeLog();
    logRequest(this.req_log, res_log, this.logs);
    (this.res as SocketResponse).fn({
      data: this.appRes.data,
      status: this.appRes.status,
      message: this.appRes.message,
      success: this.appRes.status == 200,
    });
  }
  async http() {
    if (this.appRes.status == -1) return;
    await this.postHooks();
    const res_log = this.makeLog();
    logRequest(this.req_log, res_log, this.logs);
    (this.res as HttpResponse).json({
      data: this.appRes.data,
      status: this.appRes.status,
      message: this.appRes.message,
      success: this.appRes.status == 200,
    });
  }
  makeLog(): ResponseLog {
    return {
      method: this.req.method,
      ip: this.req.ip,
      url: this.req.originalUrl,
      status: this.appRes.status || 0,
      endTime: Date.now(),
    };
  }

  async postHooks() {
    if (this.res.__locals) {
      let hooks = this.res.__locals.hooks.reverse();
      while (hooks.length) {
        const hook = hooks.pop()!;
        const changes: any = await hook(this.appRes.rawData);
        this.appRes.data = {
          ...this.appRes.data,
          ...changes,
        };
      }
    }
  }
}
