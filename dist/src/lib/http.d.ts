/// <reference types="node" />
import http from "http";
import { Express } from "express";
import { AppContextOpts } from "./context";
export declare function createHttpApp(): Express;
export declare function createHttpServer(httpApp: Express): http.Server;
export declare function createCoreServer(opts: AppContextOpts): http.Server;
export declare function bootHttpApp(): Promise<import("../../dist/lib/context").AppContext>;
