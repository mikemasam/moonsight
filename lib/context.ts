import EventEmitter from "events";
import AppCleanup from "./app.cleanup";
import AppQueue from "./queue";
import { RedisClientType, createClient } from "redis";
import { KernelArgs } from "..";
import app$version from "./app.version";
import { Express } from "express";
import http from "http";
import { createCoreServer, createHttpApp, createHttpServer } from "./http";
import { createCoreIOServer, createSocketIOServer } from "./socket";
import { Namespace } from "socket.io";
import CoreNetSelector from "./corenet/net";
import { IHttpMiddleware } from "./router/middlewares";
import events from "./events";

export const getContext = (): AppContext => {
  return global.deba_kernel_ctx;
};
export default async function createContext(
  opts: KernelArgs
): Promise<AppContext> {
  opts.version = await app$version(opts);
  if (opts.coreHost && opts.mountCore.mount)
    throw "[KernelJs] ~ Kernel failed to start, [coreMount and coreHost] only one is required.";
  if (!opts.channelName)
    throw "[KernelJs] ~ Kernel failed to start, channelName is required.";
  if (!opts.redis)
    throw "[KernelJs] ~ Kernel failed to start, redis config is required.";
  if (!opts.port)
    throw "[KernelJs] ~ Kernel failed to start, port is required.";
  if (!opts.settings) opts.settings = {};
  if (!opts.nodeIdentity || opts.nodeIdentity.length != 3)
    throw "[KernelJs] ~ Kernel failed to start, nodeIdentity is required [0-9]{3}.";
  if (!opts.host) opts.host = "localhost";
  opts.host = `${opts.host}:${opts.port}`;

  const basePath =
    opts.apiMount && opts.apiMount?.length ? `/${opts.apiMount}` : "";
  const appOpts: AppContextOpts = {
    channelName: opts.channelName,
    version: opts.version,
    maxListeners: 20,
    host: opts.host,
    apiBasePath: basePath,
    apiPath: opts.apiPath,
    coreHost: opts.coreHost,
    apiMount: opts.apiMount,
    nodeIdentity: opts.nodeIdentity,
    apiMiddlewares: null,
    redis: { url: opts.redis.url },
    port: opts.port,
    shutdownTimeout: opts.shutdownTimeout || 30,
    mountCore: {
      port: opts.mountCore.port,
      mount: opts.mountCore.mount,
      allowedIPs: opts.mountCore.allowedIPs,
    },
    settings: {},
    logging: {
      ...opts.logging,
    },
  };
  const httpApp = createHttpApp();
  const coreServer = createCoreServer(appOpts);
  const httpServer = createHttpServer(httpApp);
  const socketIO = await createSocketIOServer(httpServer, appOpts, events);
  const coreIO = await createCoreIOServer(coreServer, appOpts, events);
  let context: AppContext = {
    autoBoot: opts.autoBoot,
    mocking: opts.mocking,
    events: events,
    queue: new AppQueue(),
    opts: appOpts,
    net: {
      httpApp: httpApp,
      httpServer: httpServer,
      middlewares: [],
      RedisClient: createClient({ url: opts.redis.url }),
      socketIO: socketIO,
      coreServer: coreServer,
      coreIO: coreIO,
      startup: () => null,
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
    },
    cleanup: AppCleanup(),
    boot: async () => false,
  };
  return context;
}

export type AppContextOptsLogging = {
  all?: boolean;
  http?: boolean;
  core?: boolean;
  socket?: boolean;
  loader?: boolean;
  error?: boolean;
  networking?: boolean;
  queue?: boolean;
  job?: boolean;
  kernel?: boolean;
  [key: string]: boolean | undefined;
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
  nodeIdentity: string;
  maxListeners: number | 20;
  host: string;
  redis: { url: string };
  apiBasePath: string;
  apiPath: string;
  apiMount: string;
  coreHost: string;
  apiMiddlewares: string | null;
  port: number;
  shutdownTimeout: number;
  mountCore: AppContextOptsMountCore;
  settings: AppContextOptsSettings;
  logging: AppContextOptsLogging;
}
export interface AppContextNet {
  middlewares: IHttpMiddleware[];
  httpApp: Express;
  httpServer: http.Server;
  coreServer: http.Server;
  RedisClient: RedisClientType;
  socketIO: Namespace;
  coreIO: Namespace | null;
  RedisClientSubscriber?: any;
  coreNet?: CoreNetSelector;
  //bootRedis: () => Promise<void>;
  startup: () => void;
}
export interface AppContextState {
  redisReady: boolean;
  httpReady: boolean;
  up: boolean;
  count: number;
  shutdown: boolean;
  timeout: number;
  corenetReady: boolean;
}

export interface AppContext {
  autoBoot: boolean;
  mocking: boolean;
  ready: boolean | undefined;
  opts: AppContextOpts;
  net: AppContextNet;
  state: AppContextState;
  queue: AppQueue;
  cleanup: AppCleanup;
  events: EventEmitter;
  boot: () => Promise<boolean>;
}

export interface AppCleanup {
  add: (name: any, action: () => void) => void;
  dispose: () => void;
}

declare global {
  var deba_kernel_ctx: AppContext;
}
