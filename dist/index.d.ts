import UID from "./lib/universal.identity";
import TestRegex from "./lib/testregex";
import { CoreNet } from "./lib/corenet/index";
import { AppContext, AppContextOptsLogging, AppContextOptsMountCore, AppContextOptsSettings } from "./lib/context";
import UnhandledReponse from "./responders/UnhandledReponse";
import NotFound from "./responders/NotFound";
import NoResponse from "./responders/NoResponse";
import EmptyResponse from "./responders/EmptyResponse";
import FailedResponse from "./responders/FailedResponse";
import CreateRequestState, { RequestState } from "./responders/Request";
import BasicResponse from "./responders/Response";
import IHttp, { IHttpGet, IHttpPost, IHttpDelete, IHttpPut } from "./handlers/IHttp";
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
export default function create$kernel(args: KernelArgs, beforeHooks?: (() => Promise<any>)[], afterHooks?: ((ctx: AppContext) => Promise<any>)[]): Promise<AppContext>;
declare const UUID: typeof UID;
declare const Request: typeof CreateRequestState;
declare const Response: typeof BasicResponse;
export { UnhandledReponse, NotFound, Response, //depricated
BasicResponse, EmptyResponse, FailedResponse, IHttp, IHttpGet, IHttpPost, IHttpDelete, IHttpPut, IHttpMiddleware, ISocket, ISocketMount, ICore, IMount, IBatchHttp, ISub, IJob, CoreNet, TestRegex, Request, //depricated
RequestState, NoResponse, UUID, UID, z, };
export type * from "./handlers/BaseHander";
export type * from "./lib/context";
export type * from "./lib/AppState";
