import UID from "../lib/universal.identity";
import { getContext } from "../lib/context";
import {
  ISocketMountConfig,
  ISocketMountRoute,
  ISocketMountRouteHandler,
  RouteStat,
  SocketRequest,
  SocketResponse,
} from "./BaseHander";
import FailedResponse from "../responders/FailedResponse";
import CreateAppState from "../lib/AppState";
import UnhandledReponse from "../responders/UnhandledReponse";
import { makeAsyncHandler } from "../utils/asyncHander";

export default function ISocketMount(
  async_handler: ISocketMountRouteHandler,
  _?: unknown,
  config?: ISocketMountConfig,
) {
  const handler = makeAsyncHandler(async_handler);
  function ISocketMountHandler(stat: RouteStat): ISocketMountRoute {
    return async (
      req: SocketRequest,
      res: SocketResponse,
      next: (err?: Error) => void,
    ) => {
      const log = {
        path: stat.location,
        ctx: getContext(),
        startTime: Date.now(),
      };
      if (!getContext().ready) return FailedResponse().json(log, req, res);
      if (config) {
        if (!UID.latestVersion(req.query?.version, config.minVersion || false))
          return FailedResponse({
            status: 405,
            data: { status: 405 },
            message: "Please update to latest version to continue",
          }).json(log, req, res);
      }
      getContext().state.count++;
      return handler(req, CreateAppState())
        .catch((_r: Error) => UnhandledReponse(_r))
        .then((_r) => {
          getContext().state.count--;
          return _r?.responder ? _r.json(log, req, res).socket() : next();
        });
    };
  }
  ISocketMountHandler.__ihandler = "isocketmount";
  return ISocketMountHandler;
}
