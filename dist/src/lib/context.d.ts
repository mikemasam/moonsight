/// <reference types="node" />
/// <reference types="node" />
import EventEmitter from "events";
import AppQueue from "./queue";
import { RedisClientType } from "redis";
import { KernelArgs } from "..";
import { Express } from "express";
import http from "http";
import { Namespace } from "socket.io";
import CoreNetSelector from "./corenet/net";
import { IHttpMiddleware } from "./router/middlewares";
export declare const getContext: () => AppContext;
export default function createContext(opts: KernelArgs): Promise<AppContext>;
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
    redis: {
        url: string;
    };
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
