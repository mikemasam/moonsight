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

  get(name: string) {
    if (this.current_req.__type == "ihttp") {
      return (this.current_req as HttpRequest).locals[name];
    } else if (this.current_req.__type == "isocket") {
      return this.current_req.socket.locals[name];
    } else if (this.current_req.__type == "isocketmount") {
      return this.current_req.socket.locals[name];
    } else if (this.current_req.__type == "icore") {
      return this.current_req.socket.locals[name];
    }
    return null;
  }

  put(name: string, data: any) {
    if (this.current_req.__type == "ihttp") {
      (this.current_req as HttpRequest).locals[name] = data;
    } else if (this.current_req.__type == "isocket") {
      this.current_req.socket.locals[name] = data;
    } else if (this.current_req.__type == "isocketmount") {
      this.current_req.socket.locals[name] = data;
    } else if (this.current_req.__type == "icore") {
      this.current_req.socket.locals[name] = data;
    }
  }
}

export default function CreateRequestState(req: CurrentRequest) {
  return new RequestState(req);
}
