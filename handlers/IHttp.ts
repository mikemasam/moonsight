import UID from "../lib/universal.identity";
import { Request, Response } from "express";
import { RouteStat } from "../lib/router/index";
import { getContext } from "../lib/context";
import {
  HttpRequest,
  HttpResponse,
  IHandler,
  iRouteHandler,
} from "./BaseHander";
import FailedResponse from "../responders/FailedResponse";
import CreateAppState from "../lib/AppState";
import EmptyResponse from "../responders/EmptyResponse";
import UnhandledReponse from "../responders/UnhandledReponse";
const AsyncFn = (async () => null).constructor;

type IHttpConfig = {
  minVersion?: string;
};
type IHttpRoute = (req: HttpRequest, res: HttpResponse) => void;
export type IHttpRouteHandler = [IHttpRoute, any[]];
export default function IHttp(
  handler: iRouteHandler,
  middlewares: string[],
  config?: IHttpConfig
): IHandler<IHttpRouteHandler> {
  function iHttpHandler(stat: RouteStat): IHttpRouteHandler {
    if (handler instanceof AsyncFn !== true)
      throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
    return [
      (req: HttpRequest, res: HttpResponse) => {
        const { startTime } = res.__locals;
        const log = {
          path: stat.location,
          ctx: getContext(),
          startTime,
        };
        if (!getContext().ready) return FailedResponse().json(log, req, res);
        if (config) {
          if (!UID.latestVersion(req.query?.["v"], config.minVersion || false))
            return FailedResponse({
              status: 405,
              message: "Please update to latest version to continue",
            }).json(log, req, res);
        }
        getContext().state.count++;
        handler(req, res, CreateAppState())
          .then((_r) => (_r ? _r : EmptyResponse()))
          .catch((_r: Error) => UnhandledReponse(_r))
          .then((_r) => {
            getContext().state.count--;
            return _r.json(log, req, res).http();
          });
      },
      middlewares,
    ];
  }

  iHttpHandler.__ihandler = "ihttp";
  return iHttpHandler;
}
