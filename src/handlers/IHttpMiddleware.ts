import { IHandler, IHttpMiddlewareHandler, RouteStat } from "./BaseHander";

const AsyncFn = (async () => null).constructor;
export default function IHttpMiddleware(
  handler: IHttpMiddlewareHandler
): IHandler<IHttpMiddlewareHandler> {
  function iHttpHandler(stat: RouteStat): IHttpMiddlewareHandler {
    //if (handler instanceof AsyncFn !== true)
    //throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
    return handler;
  }
  iHttpHandler.__ihandler = "ihttp.middleware";
  return iHttpHandler;
}
