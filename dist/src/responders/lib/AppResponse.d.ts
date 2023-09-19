import { NetRequest, NetResponse, RequestLog } from "../../handlers/BaseHander";
import JsonResponder from "./JsonResponder";
export default class AppResponse {
    data: any;
    status: number;
    message: string;
    rawData?: any;
    responder: boolean;
    error?: Error;
    constructor(data: any, status: number, message: string);
    json(log: RequestLog, req: NetRequest, res: NetResponse): JsonResponder;
}
