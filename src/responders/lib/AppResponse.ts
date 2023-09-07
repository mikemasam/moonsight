import { NetRequest, NetResponse, RequestLog } from "../../handlers/BaseHander";
import JsonResponder from "./JsonResponder";

export default class AppResponse {
  public data: any;
  public status: number;
  public message: string;
  public rawData?: any = null;
  public responder = true;
  public error?: Error;
  constructor(data: any, status: number, message: string) {
    this.data = data;
    this.status = status;
    this.message = message;
  }
  public json(log: RequestLog, req: NetRequest, res: NetResponse) {
    return new JsonResponder(this, log, req, res);
  }
}
