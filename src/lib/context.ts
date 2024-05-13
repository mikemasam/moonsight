import EventEmitter from "events";
import AppCleanup from "./app.cleanup";
import AppQueue from "./queue";
import { RedisClientType, createClient } from "redis";
import { IAnyMiddlewareRoute, IHandler, KernelArgs } from "..";
import app$version from "./app.version";
import { Express } from "express";
import http from "http";
import { createCoreServer, createHttpApp, createHttpServer } from "./http";
import { createCoreIOServer, createSocketIOServer } from "./socket";
import { Namespace } from "socket.io";
import CoreNetSelector from "./corenet/net";
import events from "./events";
import logger from "./logger";
import { ArgvResult, parseArgs } from "debargs";

export const getContext = (): AppContext => {
  return global.deba_kernel_ctx;
};

function parseEnvLoggingOpts() {
  const logOpts: { [key: string]: boolean } = {};
  const logEnv: undefined | string = process.env.APP_LOGGING || undefined;
  if (logEnv == undefined) return logOpts;
  logger.kernel("logging env loaded");
  const parts = logEnv.split(",");
  for (let part of parts) logOpts[part] = true;
  return logOpts;
}

export default async function createContext(
  opts: KernelArgs,
): Promise<AppContext> {
  const appArgv = parseArgs(process.argv);
  opts.appRuntimeType = appArgv.$primary.includes("cli") ? "cli" : "node";
  if (typeof opts != "object") throw new Error("invalid object type");
  opts.version = await app$version(opts);
  if (opts.coreHost && opts.mountCore?.mount)
    throw "[KernelJs] ~ Kernel failed to start, [coreMount and coreHost] only one is required.";
  if (!opts.channelName && (opts.coreHost || opts.mountCore?.mount))
    throw "[KernelJs] ~ Kernel failed to start, channelName is required when connecting to coreHost or mountCore.";
  if (!opts.port)
    throw "[KernelJs] ~ Kernel failed to start, port is required.";
  if (!opts.settings) opts.settings = {};
  if (!opts.host) opts.host = "localhost";
  opts.host = `${opts.host}:${opts.port}`;
  let mountCore: AppContextOptsMountCore | undefined = undefined;
  if (opts.mountCore) {
    mountCore = {
      port: opts.mountCore.port,
      mount: opts.mountCore.mount,
      allowedIPs: opts.mountCore.allowedIPs,
    };
  }
  const basePath =
    opts.apiMount && opts.apiMount?.length ? `/${opts.apiMount}` : "";

  const envLoggingOpts = parseEnvLoggingOpts();
  const appOpts: AppContextOpts = {
    appRuntimeType: opts.appRuntimeType!,
    channelName: opts.channelName ?? "master",
    version: opts.version,
    maxListeners: 20,
    host: opts.host,
    apiBasePath: basePath,
    apiPath: opts.apiPath,
    coreHost: opts.coreHost,
    apiMount: opts.apiMount,
    nodeIdentity: opts.nodeIdentity,
    apiMiddlewares: opts.apiMiddlewares,
    redis: opts.redis,
    port: opts.port,
    shutdownTimeout: opts.shutdownTimeout || 30,
    mountCore,
    settings: opts.settings,
    logging: {
      ...opts.logging,
      ...envLoggingOpts,
    },
  };
  const httpApp = createHttpApp();
  const coreServer = createCoreServer(appOpts);
  const httpServer = createHttpServer(httpApp);
  const socketIO = await createSocketIOServer(httpServer, appOpts, events);
  const coreIO = await createCoreIOServer(coreServer, appOpts, events);
  let context: AppContext = {
    appArgv: appArgv,
    appRuntimeType: opts.appRuntimeType!,
    autoBoot: opts.autoBoot,
    mocking: opts.mocking,
    events: events,
    hasRelation: opts.coreHost || opts.mountCore?.mount ? true : false,
    queue: new AppQueue(),
    opts: appOpts,
    net: {
      httpApp: httpApp,
      httpServer: httpServer,
      middlewares: [],
      RedisClient: opts.redis ? createClient({ url: opts.redis.url }) : null,
      socketIO: socketIO,
      coreServer: coreServer,
      coreIO: coreIO,
      httpStartup: () => null,
    },
    ready: undefined,
    state: {
      up: false,
      count: 0,
      shutdown: false,
      timeout: 0,
      corenetReady: false,
      redisReady: false,
      httpReady: false,
      bootReady: false,
    },
    cleanup: AppCleanup(),
    boot: async () : Promise<boolean> => {
      console.log("boot called")
      return false;
    },
  };
  return context;
}

export type AppContextOptsLogging = {
  all?: boolean;
  exception?: boolean;
  debug?: boolean;
  http?: boolean;
  core?: boolean;
  socket?: boolean;
  error?: boolean;
  networking?: boolean;
  corenet?: boolean;
  info?: boolean;
  queue?: boolean;
  job?: boolean;
  kernel?: boolean;
  httpmount?: boolean;
  components?: boolean;
  internal?: boolean;
  console?: boolean;
  app?: Record<string, boolean>;
  format?: "simple" | "full";
  //[key: string]: boolean | undefined;
};
export interface AppContextOptsSettings {
  [key: string]: any;
}
export interface AppContextOptsMountCore {
  port: number;
  mount: boolean;
  allowedIPs: string;
}
export interface AppContextOpts {
  channelName: string;
  version: string;
  nodeIdentity?: string;
  maxListeners: number | 20;
  host: string;
  redis?: { url: string };
  apiBasePath: string;
  apiPath: string;
  apiMount: string;
  apiMiddlewares?: string | null;
  port: number;
  shutdownTimeout: number;
  coreHost?: string;
  mountCore?: AppContextOptsMountCore;
  appRuntimeType: AppRuntimeType;
  settings: AppContextOptsSettings;
  logging: AppContextOptsLogging;
}
export interface AppContextNet {
  middlewares: IAnyMiddlewareRoute[];
  httpApp: Express;
  httpServer: http.Server;
  coreServer: http.Server;
  RedisClient: RedisClientType | null;
  socketIO: Namespace;
  coreIO: Namespace | null;
  RedisClientSubscriber?: RedisClientType | null;
  coreNet?: CoreNetSelector;
  //bootRedis: () => Promise<void>;
  httpStartup: () => void;
}
export interface AppContextState {
  redisReady: boolean;
  httpReady: boolean;
  up: boolean;
  count: number;
  shutdown: boolean;
  timeout: number;
  corenetReady: boolean;
  bootReady: boolean;
}

export type AppRuntimeType = "node" | "cli";
export interface AppContext {
  autoBoot: boolean;
  hasRelation: boolean;
  mocking: boolean | undefined;
  ready: boolean | undefined;
  opts: AppContextOpts;
  net: AppContextNet;
  state: AppContextState;
  queue: AppQueue;
  cleanup: AppCleanup;
  events: EventEmitter;
  appRuntimeType: AppRuntimeType;
  appArgv: ArgvResult;
  boot: () => Promise<boolean>;
}

export interface AppCleanup {
  add: (name: any, action: () => void) => void;
  dispose: () => void;
}

declare global {
  var deba_kernel_ctx: AppContext;
}
