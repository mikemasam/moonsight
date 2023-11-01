import UID from "../lib/universal.identity";
import { getContext } from "../lib/context";
import {
  HttpRequest,
  HttpResponse,
  IHandler,
  IMiddlewareConfig,
  RouteStat,
  iRouteHandler,
} from "./BaseHander";
import FailedResponse from "../responders/FailedResponse";
import CreateAppState from "../lib/AppState";
import EmptyResponse from "../responders/EmptyResponse";
import UnhandledReponse from "../responders/UnhandledReponse";
import logger from "../lib/logger";
const AsyncFn = (async () => null).constructor;

type IHttpMethod = "post" | "get" | "all" | "put" | "delete";
type IHttpConfig = {
  minVersion?: string;
  method?: IHttpMethod;
};
type IHttpRoute = (req: HttpRequest, res: HttpResponse) => void;
export type IHttpRouteHandler = [
  IHttpConfig,
  IHttpRoute,
  (IMiddlewareConfig | string)[] | undefined,
];
function IHttpBasic(
  handler: iRouteHandler,
  middlewares: Middlewares,
  config?: IHttpConfig,
  method?: IHttpMethod,
): IHandler<IHttpRouteHandler> {
  if (config == undefined) config = { method: "all" };
  if (method != undefined) config.method = method;
  function iHttpHandler(stat: RouteStat): IHttpRouteHandler {
    if (handler instanceof AsyncFn !== true)
      throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
    return [
      config!,
      (req: HttpRequest, res: HttpResponse) => {
        const { startTime } = res.__locals;
        const log = {
          path: stat.location,
          ctx: getContext(),
          startTime,
        };
        if (!getContext().ready)
          return FailedResponse().json(log, req, res).http();
        if (config?.minVersion) {
          if (!UID.latestVersion(req.query?.["v"], config.minVersion || false))
            return FailedResponse({
              status: 405,
              message: "Please update to latest version to continue",
            })
              .json(log, req, res)
              .http();
        }
        getContext().state.count++;
        logger.byType("debug", "start processing ", req.path);
        handler(req, res, CreateAppState())
          .then((_r) => (_r ? _r : EmptyResponse()))
          .catch((_r: any) => (_r.responder ? _r : UnhandledReponse(_r)))
          .then((_r) => {
            getContext().state.count--;
            logger.byType("debug", "end processing ", req.path);
            return _r.json(log, req, res).http();
          });
      },
      middlewares,
    ];
  }

  iHttpHandler.__ihandler = "ihttp";
  return iHttpHandler;
}

type Middlewares = (string | IMiddlewareConfig)[];
const IHttpPost = (
  handler: iRouteHandler,
  middlewares: Middlewares,
  config?: IHttpConfig,
): IHandler<IHttpRouteHandler> => {
  return IHttpBasic(handler, middlewares, config, "post");
};
const IHttpGet = (
  handler: iRouteHandler,
  middlewares: Middlewares,
  config?: IHttpConfig,
): IHandler<IHttpRouteHandler> =>
  IHttpBasic(handler, middlewares, config, "get");
const IHttpDelete = (
  handler: iRouteHandler,
  middlewares: Middlewares,
  config?: IHttpConfig,
): IHandler<IHttpRouteHandler> =>
  IHttpBasic(handler, middlewares, config, "delete");
const IHttpPut = (
  handler: iRouteHandler,
  middlewares: Middlewares,
  config?: IHttpConfig,
): IHandler<IHttpRouteHandler> =>
  IHttpBasic(handler, middlewares, config, "put");
const IHttp = (
  handler: iRouteHandler,
  middlewares: Middlewares,
  config?: IHttpConfig,
): IHandler<IHttpRouteHandler> =>
  IHttpBasic(handler, middlewares, config, "all");
export default IHttp;
export { IHttpPost, IHttpGet, IHttpPut, IHttpDelete };
