import { getContext } from "../lib/context";
import {
  HttpRequest,
  HttpResponse,
  IMiddlewareConfig,
  RouteStat,
} from "./BaseHander";
import { RequestState } from "../responders/Request";
import CreateAppState, { AppState } from "../lib/AppState";
import FailedResponse from "../responders/FailedResponse";
import { Response } from "..";
import logger from "../lib/logger";
const AsyncFn = (async () => null).constructor;
//NOTE: response is handled by handlers
// - no processing individual responses

type BatchRouteBody<T> = {
  [key: string]: T;
};
type BatchRoute<T> = (
  body: BatchRouteBody<T>,
  reqState: RequestState,
  appState: AppState
) => Promise<Object>;

export default function IBatchHttp(
  routes: { [key: string]: BatchRoute<string> },
  middlewares: IMiddlewareConfig[]
) {
  function IBatchHttpHandler(stat: RouteStat) {
    for (const key in routes) {
      const route = routes[key];
      if (key == "com")
        throw `[KernelJs] ~ ${stat.fullPath} 'com' route is not available.`;
      if (route instanceof AsyncFn !== true)
        throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
    }
    const err = (e: Error) => {
      logger.handledExeception(e);
      return null;
    };
    return [
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
        const tasks = [];
        const com = body["com"];
        for (const key in body) {
          if (key == "com") continue;
          const route = routes[key];
          if (route) {
            tasks.push(
              route({ ...com, ...body[key] }, state, CreateAppState())
                ?.catch(err)
                .then((result) => {
                  results[key] = result;
                })
            );
          } else {
            results[key] = null;
          }
        }
        Promise.all(tasks).then(() =>
          Response(results).json(log, req, res).http()
        );
        getContext().state.count--;
      },
      middlewares,
    ];
  }

  IBatchHttpHandler.__ihandler = "ihttp";
  return IBatchHttpHandler;
}
