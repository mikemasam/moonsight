import { HttpRequest, IHttpMiddleware, RequestState } from "../../src";

const authHttp = async (_: any, req: HttpRequest, __: any, args: any) => {
  const state = new RequestState(req);
  state.put("session", "hi");
};

export default IHttpMiddleware(authHttp);
