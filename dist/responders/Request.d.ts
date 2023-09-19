import { HttpRequest, SocketRequest } from "../handlers/BaseHander";
type CurrentRequest = HttpRequest | SocketRequest;
export declare class RequestState {
    private current_req;
    constructor(req: CurrentRequest);
    req(): CurrentRequest;
    get<T>(name: string): T | undefined;
    put(name: string, data: any): void;
}
export default function CreateRequestState(req: CurrentRequest): RequestState;
export {};
