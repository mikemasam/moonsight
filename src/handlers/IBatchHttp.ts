import { getContext } from "../lib/context";
import {
  HttpRequest,
  HttpResponse,
  IMiddlewareConfig,
  RouteStat,
} from "./BaseHander";
import { RequestState } from "../responders/RequestState";
import CreateAppState, { AppState } from "../lib/AppState";
import FailedResponse from "../responders/FailedResponse";
import OkResponse from "../responders/OkResponse";
import logger from "../lib/logger";
import { IHttpConfig } from "./IHttp";
import { makeAsyncHandler } from "../utils/asyncHander";
//NOTE: response is handled by handlers
// - no processing individual responses

type BatchRouteBody<T> = {
  [key: string]: T;
};
type BatchRoute<T> = (
  body: BatchRouteBody<T>,
  reqState: RequestState,
  appState: AppState,
) => Promise<Object>;

export default function IBatchHttp(
  routes: { [key: string]: BatchRoute<string> },
  middlewares: IMiddlewareConfig[],
  config?: IHttpConfig,
) {
  if (config == undefined) config = { method: "post" };
  function IBatchHttpHandler(stat: RouteStat) {
    for (const key in routes) {
      const route = routes[key];
      if (key == "com")
        throw `[KernelJs] ~ ${stat.fullPath} 'com' route is not available.`;
    }
    const err = (e: Error) => {
      logger.handledExeception(e);
      return null;
    };
    return [
      config,
      (req: HttpRequest, res: HttpResponse) => {
        const { startTime } = res.__locals;
        const log = {
          path: stat.location,
          ctx: getContext(),
          startTime,
        };
        if (!getContext().ready)
          return FailedResponse().json(log, req, res).http();
        getContext().state.count++;
        const body = req.body;
        const state = new RequestState(req);
        const results: { [key: string]: any } = {};
        const tasks: any = [];
        const com = body["com"];
        for (const key in body) {
          if (key == "com") continue;
          const route = routes[key];
          if (route) {
            tasks.push(
              makeAsyncHandler(route)(
                { ...com, ...body[key] },
                state,
                CreateAppState(),
              )
                .catch(err)
                .then((result) => {
                  results[key] = result;
                }),
            );
          } else {
            results[key] = null;
          }
        }
        Promise.all(tasks).then(() =>
          OkResponse(results).json(log, req, res).http(),
        );
        getContext().state.count--;
      },
      middlewares,
    ];
  }

  IBatchHttpHandler.__ihandler = "ihttp";
  return IBatchHttpHandler;
}
