import { Router } from "express";
import { getContext } from "../lib/context";
import CreateAppState, { AppState } from "../lib/AppState";
import { IHandler, RouteStat } from "./BaseHander";
import { makeAsyncHandler } from "../utils/asyncHander";
import { cleanRoutePath } from "../lib/router/http-handlers";
import logger from "../lib/logger";
type IConsoleArgs = { path: string; router: Router };
type IConsoleOpts = { event_name?: string };
type IConsoleHandler = (state: AppState, args: IConsoleArgs) => Promise<any>;
export default function IConsole(
  async_handler: IConsoleHandler,
  opts: IConsoleOpts,
) {
  const handler = makeAsyncHandler(async_handler);
  function IConsoleHandler(stat: RouteStat, path: string) {
    let shouldExec = false;
    const $primary = getContext().appArgv.$primary;
    if ($primary.indexOf(path) > -1) shouldExec = true;
    if (!shouldExec) {
      const splited = path.split(":").slice(1);
      let start = $primary.indexOf(splited[0]);
      if (start > -1) {
        let elem = null;
        while ((elem = splited.shift())) {
          if ($primary[start] != elem) {
            shouldExec = false;
            break;
          } else {
            shouldExec = true;
          }
          start += 1;
        }
      }
    }
    logger.byType("console", stat, ", should execute: ", shouldExec, ", path: ", path);
    if (opts.event_name == "kernel.boot.ready") { 
      if(!shouldExec) return;
      handler(CreateAppState(), {
        path: stat.path,
        router: stat.router,
      });
    } else if (opts.event_name == "kernel.ready") {
      if(!shouldExec) return;
      getContext().events.once("kernel.ready", () => {
        handler(CreateAppState(), {
          path: stat.path,
          router: stat.router,
        });
      });
    } else {
      if(!shouldExec) return;
      getContext().events.once("kernel.ready", (...args) => {
        handler(CreateAppState(), {
          path: stat.path,
          router: stat.router,
        });
      });
    }
  }
  IConsoleHandler.__ihandler = "iconsole";
  return IConsoleHandler;
}
