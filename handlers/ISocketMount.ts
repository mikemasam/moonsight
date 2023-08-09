import UID from "../lib/universal.identity";
import { getContext } from "../lib/context";
import {
  ISocketMountConfig,
  ISocketMountRoute,
  ISocketMountRouteHandler,
  SocketRequest,
  SocketResponse,
} from "./BaseHander";
import { RouteStat } from "../lib/router/index";
import FailedResponse from "../responders/FailedResponse";
import CreateAppState from "../lib/AppState";
import UnhandledReponse from "../responders/UnhandledReponse";

const AsyncFn = (async () => null).constructor;
export default function ISocketMount(
  handler: ISocketMountRouteHandler,
  _?: unknown,
  config?: ISocketMountConfig
) {
  function ISocketMountHandler(stat: RouteStat): ISocketMountRoute {
    if (handler instanceof AsyncFn !== true)
      throw `[KernelJs] ~ ${stat.fullPath} ISocketMount async handler function is required.`;
    return async (
      req: SocketRequest,
      res: SocketResponse,
      next: (err?: Error) => void
    ) => {
      const log = {
        path: stat.location,
        ctx: getContext(),
        startTime: Date.now(),
      };
      if (!getContext().ready) return FailedResponse().json(log, req, res);
      if (config) {
        if (!UID.latestVersion(req.query.version, config.minVersion || false))
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
