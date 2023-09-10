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
  private route_log: RouteLog = {};
  constructor(
    appRes: AppResponse,
    req_log: RequestLog,
    req: NetRequest,
    res: NetResponse,
  ) {
    this.appRes = appRes;
    this.req_log = req_log;
    this.req = req;
    this.res = res;
    this.route_log.err = appRes.error;
  }
  responsePayload() {
    return {
      ...this.appRes.payload,
      success: this.appRes.payload.status == 200,
    };
  }
  async socket() {
    if (this.appRes.payload.status == -1) return;
    await this.postHooks();
    const res_log = this.makeLog();
    logRequest(this.req_log, res_log, this.route_log);
    (this.res as SocketResponse).fn(this.responsePayload());
  }
  async http() {
    if (this.appRes.payload.status == -1) return;
    await this.postHooks();
    const res_log = this.makeLog();
    logRequest(this.req_log, res_log, this.route_log);
    (this.res as HttpResponse).json(this.responsePayload());
  }
  makeLog(): ResponseLog {
    return {
      method: this.req.method,
      ip: this.req.ip,
      url: this.req.originalUrl,
      status: this.appRes.payload.status || 0,
      endTime: Date.now(),
    };
  }
  //TODO: handle postHook exceptions
  async postHooks() {
    if (this.res.__locals) {
      let hooks = this.res.__locals.hooks.reverse();
      const status = this.responsePayload();
      while (hooks.length) {
        const hook = hooks.pop()!;
        const changes: any = await hook(this.appRes.rawData, status);
        this.appRes.payload = {
          ...this.appRes.payload,
          ...changes,
        };
      }
    }
  }
}
