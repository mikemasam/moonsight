import { SystemEvents } from "./lib/events";
import Router from "./lib/router/index";
import UID from "./lib/universal.identity";
import TestRegex from "./lib/testregex";
import CoreNetwork, { CoreNet } from "./lib/corenet/index";
import { AppLogger } from "./lib/logger"
import createContext, {
  AppContext,
  AppContextOptsLogging,
  AppContextOptsMountCore,
  AppContextOptsSettings,
} from "./lib/context";
import { bootHttpApp } from "./lib/http";
import bootRedis from "./lib/boot.redis";
import UnhandledReponse from "./responders/UnhandledReponse";
import NotFound from "./responders/NotFound";
import NoResponse from "./responders/NoResponse";
import EmptyResponse from "./responders/EmptyResponse";
import FailedResponse from "./responders/FailedResponse";
import CreateRequestState, { RequestState } from "./responders/Request";
import BasicResponse from "./responders/Response";
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
import IHttpMiddleware from "./handlers/IHttpMiddleware";
import z from "zod";

export interface KernelArgs {
  host: string;
  autoBoot: boolean;
  mocking?: boolean;
  apiPath: string;
  apiMount: string;
  coreHost?: string;
  version: string;
  channelName: string;
  nodeIdentity: string;
  redis: {
    url: string;
  };
  apiMiddlewares: string | null;
  port: number;
  shutdownTimeout?: number;
  mountCore?: AppContextOptsMountCore;
  settings: AppContextOptsSettings;
  logging: AppContextOptsLogging;
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
    if (global.deba_kernel_ctx.state.up) return false;
    global.deba_kernel_ctx.state.up = true;
    return new Promise(async (reslv: (a: boolean) => void) => {
      global.deba_kernel_ctx.events.once("kernel.ready", () => reslv(true));
      await bootRedis();
      global.deba_kernel_ctx.net.startup();
    });
  };
  if (global.deba_kernel_ctx.autoBoot) await global.deba_kernel_ctx.boot();
  return global.deba_kernel_ctx;
}

const UUID = UID;
const Request = CreateRequestState;
const Response = BasicResponse;
export {
  UnhandledReponse,
  NotFound,
  Response, //depricated
  BasicResponse,
  EmptyResponse,
  FailedResponse,
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
  IBatchHttp,
  ISub,
  IJob,
  CoreNet,
  TestRegex,
  Request, //depricated
  RequestState,
  NoResponse,
  UUID,
  UID,
  z,
  AppLogger
};

export type * from "./handlers/BaseHander";
export type * from "./lib/context";
export type * from "./lib/AppState";
