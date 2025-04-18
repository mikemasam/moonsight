import { SystemEvents, runBackgroundTasks } from "./lib/events";
import Router from "./lib/router/index";
import UID from "./lib/universal.identity";
import TestRegex from "./lib/testregex";
import CoreNetwork, { CoreNet } from "./lib/corenet/index";
import logger, { AppLogger } from "./lib/logger";
import createContext, {
  AppContext,
  AppContextOptsLogging,
  AppContextOptsMountCore,
  AppContextOptsSettings,
  AppRuntimeType,
  getContext,
} from "./lib/context";
import { bootHttpApp } from "./lib/http";
import bootRedis from "./lib/boot.redis";
import UnhandledReponse from "./responders/UnhandledReponse";
import NotFound from "./responders/NotFound";
import NoResponse from "./responders/NoResponse";
import EmptyResponse from "./responders/EmptyResponse";
import FailedResponse from "./responders/FailedResponse";
import CreateRequestState, { RequestState } from "./responders/RequestState";
import OkResponse from "./responders/OkResponse";
import IHttp, {
  IHttpGet,
  IHttpPost,
  IHttpDelete,
  IHttpPut,
} from "./handlers/IHttp";
import ISocket from "./handlers/ISocket";
import ISocketMount from "./handlers/ISocketMount";
import ICore from "./handlers/ICore";
import IMount from "./handlers/IMount";
import IBatchHttp from "./handlers/IBatchHttp";
import ISub from "./handlers/ISub";
import IJob from "./handlers/IJob";
import IConsole from "./handlers/IConsole";
import IHttpMiddleware from "./handlers/IHttpMiddleware";
import * as z from "zod";
import CreateAppState from "./lib/AppState";

export interface KernelArgs {
  host: string;
  appRuntimeType?: AppRuntimeType;
  autoBoot: boolean;
  mocking?: boolean;
  apiPath: string;
  apiMount: string;
  coreHost?: string;
  version: string;
  channelName?: string;
  nodeIdentity?: string;
  redis?: {
    url: string;
  };
  apiMiddlewares?: string | null;
  port: number;
  shutdownTimeout?: number;
  mountCore?: AppContextOptsMountCore;
  settings?: AppContextOptsSettings;
  logging?: AppContextOptsLogging;
}

export default async function create$kernel(
  args: KernelArgs,
  beforeHooks?: (() => Promise<any>)[],
  afterHooks?: ((ctx: AppContext) => Promise<any>)[],
) {
  if (beforeHooks) await Promise.all(beforeHooks.map((c) => c()));
  global.deba_kernel_ctx = await createContext(args);
  await SystemEvents();
  await Router();
  await CoreNetwork();
  await bootHttpApp();
  global.deba_kernel_ctx.queue.initQueue();
  if (afterHooks) {
    global.deba_kernel_ctx.events.on("kernel.ready", async () => {
      Promise.all(afterHooks.map((c) => c(global.deba_kernel_ctx)));
    });
  }
  if (!global.deba_kernel_ctx.opts.port) {
    throw new Error(
      `[KernelJs] ~ Invalid server port [port] = ${global.deba_kernel_ctx.opts.port}.`,
    );
  }
  global.deba_kernel_ctx.boot = async () => {
    if (global.deba_kernel_ctx.state.up) {
      logger.kernel("already up");
      return false;
    }
    global.deba_kernel_ctx.state.up = true;
    return new Promise(async (reslv: (a: boolean) => void) => {
      global.deba_kernel_ctx.events.once("kernel.ready", () => reslv(true));
      await bootRedis();
      global.deba_kernel_ctx.net.httpStartup();
      global.deba_kernel_ctx.events.emit("kernel.internal.boot.ready");
    });
  };
  if (global.deba_kernel_ctx.autoBoot) await global.deba_kernel_ctx.boot();
  await runBackgroundTasks();
  return global.deba_kernel_ctx;
}

const UUID = UID;
const makeAppState = CreateAppState;
const Request = CreateRequestState;
const Response = OkResponse;
export {
  makeAppState,
  UnhandledReponse,
  NotFound,
  OkResponse,
  EmptyResponse,
  FailedResponse,
  Response,
  Request,
  //IHTTP
  IHttp,
  IHttpGet,
  IHttpPost,
  IHttpDelete,
  IHttpPut,
  IHttpMiddleware,
  ISocket,
  ISocketMount,
  ICore,
  IMount,
  IConsole,
  IBatchHttp,
  ISub,
  IJob,
  CoreNet,
  TestRegex,
  RequestState,
  NoResponse,
  UUID,
  UID,
  z,
  AppLogger,
};

export type { AppState }  from './lib/AppState';
export * from "./handlers/BaseHander";
export type * from "./lib/context";
