import { SystemEvents } from "./lib/events";
import Router from "./lib/router/index";
import Doctor from "./doctor/index.js";
import UID from "./lib/universal.identity";
import TestRegex from "./lib/testregex";
import CoreNetwork, { CoreNet } from "./lib/corenet/index";
import createContext, {
  AppContextOptsLogging,
  AppContextOptsMountCore,
  AppContextOptsSettings,
} from "./lib/context";
import { bootHttpApp } from "./lib/http";
import bootRedis from "./lib/boot.redis";
import UnhandledReponse from "./responders/UnhandledReponse";
import NotFound from "./responders/NotFound";
import PaginatedResponse from "./responders/PaginatedResponse";
import NoResponse from "./responders/NoResponse";
import EmptyResponse from "./responders/EmptyResponse";
import FailedResponse from "./responders/FailedResponse";
import { RequestState } from "./responders/Request";
import BasicResponse from "./responders/Response";
import IHttp from "./handlers/IHttp";
import ISocket from "./handlers/ISocket";
import ISocketMount from "./handlers/ISocketMount";
import ICore from "./handlers/ICore";
import IMount from "./handlers/IMount";
import IBatchHttp from "./handlers/IBatchHttp";
import ISub from "./handlers/ISub";
import IJob from "./handlers/IJob";

export interface KernelArgs {
  host: string;
  autoBoot: boolean;
  mocking: boolean;
  apiPath: string;
  apiMount: string;
  coreHost: string;
  version: string;
  channelName: string;
  nodeIdentity: string;
  redis: {
    url: string;
  };
  apiMiddlewares: string | null;
  port: number;
  shutdownTimeout?: number;
  mountCore: AppContextOptsMountCore;
  settings: AppContextOptsSettings;
  logging: AppContextOptsLogging;
}

export default async function create$kernel(args: KernelArgs) {
  global.deba_kernel_ctx = await createContext(args);
  await SystemEvents();
  await Router();
  await CoreNetwork();
  await bootHttpApp();
  global.deba_kernel_ctx.queue.initQueue();
  if (!global.deba_kernel_ctx.opts.port) {
    throw new Error(
      `[KernelJs] ~ Invalid server port [port] = ${global.deba_kernel_ctx.opts.port}.`
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
const Request = RequestState;
const Response = BasicResponse;
export {
  UnhandledReponse,
  NotFound,
  PaginatedResponse,
  Response, //depricated
  BasicResponse,
  EmptyResponse,
  FailedResponse,
  IHttp,
  ISocket,
  ISocketMount,
  ICore,
  IMount,
  IBatchHttp,
  ISub,
  IJob,
  CoreNet,
  Request, //depricated
  RequestState,
  NoResponse,
  UUID,
  UID,
  Doctor,
  TestRegex,
};
