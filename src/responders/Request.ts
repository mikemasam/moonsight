import { HttpRequest, SocketRequest } from "../handlers/BaseHander";

type CurrentRequest = HttpRequest | SocketRequest;
export class RequestState {
  private current_req: CurrentRequest;
  constructor(req: CurrentRequest) {
    this.current_req = req;
  }
  req() {
    return this.current_req;
  }

  get<T>(name: string): T | undefined {
    if(!this.current_req) return undefined;
    const _type = this.current_req.__type;
    if (_type == "ihttp") {
      return (this.current_req as HttpRequest).locals[name];
    } else if (
      _type == "isocket" ||
      _type == "isocketmount" ||
      _type == "icore"
    ) {
      return this.current_req.socket?.locals[name];
    }
    return undefined;
  }

  put(name: string, data: any) {
    if(!this.current_req) return undefined;
    const _type = this.current_req.__type;
    if (_type == "ihttp") {
      (this.current_req as HttpRequest).locals[name] = data;
    } else if (
      _type == "isocket" ||
      _type == "isocketmount" ||
      _type == "icore"
    ) {
      if (this.current_req.socket) this.current_req.socket.locals[name] = data;
    }
  }
}

export default function CreateRequestState(req: CurrentRequest) {
  return new RequestState(req);
}
