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
    const regex = new RegExp(`^\:?${path.replace(/\:/g, "\\:|\\.")}$`, "");
    const $primary = getContext().appArgv.$primary.slice(2).join(".");
    logger.byType(
      "console",
      stat,
      ", should execute: ",
      regex.test($primary),
      ", path: ",
      path,
    );
    if (!regex.test($primary)) return;
    getContext().tasks.push({
      name: path,
      action: async () =>
        handler(CreateAppState(), {
          path: stat.path,
          router: stat.router,
        }),
    });
  }
  IConsoleHandler.__ihandler = "iconsole";
  return IConsoleHandler;
}
