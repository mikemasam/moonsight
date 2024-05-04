import { Router } from "express";
import { getContext } from "../lib/context";
import CreateAppState, { AppState } from "../lib/AppState";
import { RouteStat } from "./BaseHander";
import { makeAsyncHandler } from "../utils/asyncHander";
const AsyncFn = (async () => null).constructor;
type IMountArgs = { path: string; router: Router };
type IMountHandler = (state: AppState, args: IMountArgs) => Promise<any>;
export default function IMount(async_handler: IMountHandler, opts?: string[]) {
  const handler = makeAsyncHandler(async_handler);
  function IMountHandler(stat: RouteStat) {
    if (opts?.length && opts.indexOf("kernel.boot") > -1) {
      handler(CreateAppState(), {
        path: stat.path,
        router: stat.router,
      });
    } else if (opts?.length && opts.indexOf("kernel.ready") > -1) {
      getContext().events.once("kernel.ready", () => {
        handler(CreateAppState(), {
          path: stat.path,
          router: stat.router,
        });
      });
    } else {
      getContext().events.once("kernel.ready", () => {
        handler(CreateAppState(), {
          path: stat.path,
          router: stat.router,
        });
      });
    }
  }
  IMountHandler.__ihandler = "imount";
  return IMountHandler;
}
