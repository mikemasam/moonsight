import CreateAppState from "../lib/AppState";
import { getContext } from "../lib/context";
import EmptyResponse from "../responders/EmptyResponse";
import UnhandledReponse from "../responders/UnhandledReponse";
import { makeAsyncHandler } from "../utils/asyncHander";
import {
  CoreRouteHandler,
  IHandler,
  IMiddlewareConfig,
  RequestLog,
  RouteStat,
  SocketRequest,
  SocketResponse,
} from "./BaseHander";

export type ICoreRoute = (req: SocketRequest, res: SocketResponse) => void;
export type ICoreRouteHandler = [ICoreRoute, IMiddlewareConfig[] | string[]];

export default function ICore(
  async_handler: CoreRouteHandler,
  middlewares: IMiddlewareConfig[] | string[] | undefined,
): IHandler<ICoreRouteHandler> {
  const handler = makeAsyncHandler(async_handler);
  function ICoreHandler(stat: RouteStat): ICoreRouteHandler {
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
          .catch((_r) => {
            return _r.responder ? _r : UnhandledReponse(_r);
          })
          .then((_r) => {
            getContext().state.count--;
            return _r.json(log, req, res).socket();
          });
      },
      middlewares || [],
    ];
  }

  ICoreHandler.__ihandler = "icore";
  return ICoreHandler;
}
