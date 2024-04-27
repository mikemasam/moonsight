import UID from "../lib/universal.identity";
import {
  IHandler,
  IMiddlewareConfig,
  RouteStat,
  SocketRequest,
  SocketResponse,
  iRouteHandler,
  iSocketHandler,
} from "./BaseHander";
import { getContext } from "../lib/context";
import FailedResponse from "../responders/FailedResponse";
import CreateAppState from "../lib/AppState";
import EmptyResponse from "../responders/EmptyResponse";
import UnhandledReponse from "../responders/UnhandledReponse";
import { makeAsyncHandler } from "../utils/asyncHander";

type ISocketConfig = {
  minVersion: string | undefined;
};

export type ISocketRoute = (req: SocketRequest, res: SocketResponse) => void;
export type ISocketRouteHandler = [
  ISocketRoute,
  IMiddlewareConfig[] | string[]
];
export default function ISocket(
  async_handler: iSocketHandler,
  middlewares: IMiddlewareConfig[] | string[],
  config?: ISocketConfig
): IHandler<ISocketRouteHandler> {
  const handler = makeAsyncHandler(async_handler)
  function ISocketHandler(stat: RouteStat): ISocketRouteHandler {
    return [
      (req: SocketRequest, res: SocketResponse) => {
        const log = {
          path: stat.location,
          opts: getContext().opts,
          startTime: Date.now(),
        };
        if (!getContext().ready)
          return FailedResponse().json(log, req, res).socket();
        if (
          config?.minVersion &&
          !UID.latestVersion(req.query?.version, config.minVersion || false)
        )
          return FailedResponse({
            status: 405,
            data: { status: 405 },
            message: "Please update to latest version to continue",
          })
            .json(log, req, res)
            .socket();
        getContext().state.count++;
        handler(req, res, CreateAppState())
          .then((_r) => (_r ? _r : EmptyResponse()))
          .catch((_r: Error) => UnhandledReponse(_r))
          .then((_r) => {
            getContext().state.count--;
            return _r.json(log, req, res).socket();
          });
      },
      middlewares,
    ];
  }

  ISocketHandler.__ihandler = "isocket";
  return ISocketHandler;
}
