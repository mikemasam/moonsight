/// <reference types="node" />
/// <reference types="node" />
import { Namespace } from "socket.io";
import http from "http";
import { AppContextOpts } from "../context";
import EventEmitter from "events";
export declare function createCoreIOServer(coreServer: http.Server, opts: AppContextOpts, events: EventEmitter): Promise<Namespace | null>;
export declare function createSocketIOServer(httpServer: http.Server, opts: AppContextOpts, events: EventEmitter): Promise<Namespace>;
