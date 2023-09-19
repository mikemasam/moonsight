import { HttpResponse, ResponseStatus, SocketResponse } from "../../handlers/BaseHander";
declare const addHook: (res: HttpResponse | SocketResponse) => (hook: (data: any, status: ResponseStatus) => Promise<void>) => void;
export default addHook;
