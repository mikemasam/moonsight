import {
  AppResponsePayload,
  NetRequest,
  NetResponse,
  RequestLog,
} from "../../handlers/BaseHander";
import JsonResponder from "./JsonResponder";

export default class AppResponse {
  public rawData?: any = null;
  public responder = true;
  public error?: Error;
  public payload: AppResponsePayload;
  constructor(payload: AppResponsePayload) {
    this.payload = payload;
  }
  public json(log: RequestLog, req: NetRequest, res: NetResponse) {
    return new JsonResponder(this, log, req, res);
  }
}
