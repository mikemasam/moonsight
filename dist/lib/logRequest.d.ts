import { RequestLog, ResponseLog, RouteLog } from "../handlers/BaseHander";
export default function logRequest(req_log: RequestLog, res_log: ResponseLog, route_log: RouteLog): Promise<void>;
