import { AppResponsePayload, NetRequest, NetResponse, RequestLog } from "../../handlers/BaseHander";
import JsonResponder from "./JsonResponder";
export default class AppResponse {
    rawData?: any;
    responder: boolean;
    error?: Error;
    payload: AppResponsePayload;
    constructor(payload: AppResponsePayload);
    json(log: RequestLog, req: NetRequest, res: NetResponse): JsonResponder;
}
