import { makeAsyncHandler } from "../utils/asyncHander";
import { IHandler, IHttpMiddlewareHandler, RouteStat } from "./BaseHander";

export default function IHttpMiddleware(
  handler: IHttpMiddlewareHandler,
): IHandler<IHttpMiddlewareHandler> {
  function iHttpHandler(stat: RouteStat): IHttpMiddlewareHandler {
    return handler;
  }
  iHttpHandler.__ihandler = "ihttp.middleware";
  return iHttpHandler;
}
