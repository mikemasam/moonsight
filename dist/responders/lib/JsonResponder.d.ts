import { NetRequest, NetResponse, RequestLog, ResponseLog } from "../../handlers/BaseHander";
import AppResponse from "./AppResponse";
export default class JsonResponder {
    private appRes;
    private req;
    private res;
    private req_log;
    private route_log;
    constructor(appRes: AppResponse, req_log: RequestLog, req: NetRequest, res: NetResponse);
    responsePayload(): {
        success: boolean;
        data: any;
        status: number;
        message: string;
    };
    socket(): Promise<void>;
    http(): Promise<void>;
    makeLog(): ResponseLog;
    postHooks(): Promise<void>;
}
