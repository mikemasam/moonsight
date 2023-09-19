/// <reference types="node" />
/// <reference types="node" />
import EventEmitter from "events";
import AppQueue from "./queue";
import { RedisClientType } from "redis";
import { IAnyMiddlewareRoute, KernelArgs } from "..";
import { Express } from "express";
import http from "http";
import { Namespace } from "socket.io";
import CoreNetSelector from "./corenet/net";
export declare const getContext: () => AppContext;
export default function createContext(opts: KernelArgs): Promise<AppContext>;
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
    format?: "simple" | "full";
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
    apiMiddlewares: string | null;
    port: number;
    shutdownTimeout: number;
    coreHost?: string;
    mountCore?: AppContextOptsMountCore;
    settings: AppContextOptsSettings;
    logging: AppContextOptsLogging;
}
export interface AppContextNet {
    middlewares: IAnyMiddlewareRoute[];
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
    mocking: boolean | undefined;
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
