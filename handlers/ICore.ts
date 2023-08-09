import CreateAppState from "../lib/AppState";
import { getContext } from "../lib/context";
import { RouteStat } from "../lib/router/index";
import EmptyResponse from "../responders/EmptyResponse";
import UnhandledReponse from "../responders/UnhandledReponse";
import {
  CoreRouteHandler,
  IHandler,
  IMiddlewareConfig,
  RequestLog,
  SocketRequest,
  SocketResponse,
} from "./BaseHander";

export type ICoreRoute = (req: SocketRequest, res: SocketResponse) => void;
export type ICoreRouteHandler = [ICoreRoute, IMiddlewareConfig[] | string[]];

const AsyncFn = (async () => null).constructor;
export default function ICore(
  handler: CoreRouteHandler,
  middlewares: IMiddlewareConfig[] | string[]
): IHandler<ICoreRouteHandler> {
  function ICoreHandler(stat: RouteStat): ICoreRouteHandler {
    if (handler instanceof AsyncFn !== true)
      throw `[KernelJs] ~ ${stat.fullPath} ICore async handler function is required.`;
    return [
      (req, res) => {
        const log: RequestLog = {
          path: stat.location,
          startTime: Date.now(),
        };
        //if (!getContext().ready) return FailedResponse()(log, req, res);
        getContext().state.count++;
        handler(req, res, CreateAppState())
          .then((_r) => _r || EmptyResponse())
          .catch((_r: Error) => UnhandledReponse(_r))
          .then((_r) => {
            getContext().state.count--;
            return _r.json(log, req, res).socket();
          });
      },
      middlewares,
    ];
  }

  ICoreHandler.__ihandler = "icore";
  return ICoreHandler;
}
