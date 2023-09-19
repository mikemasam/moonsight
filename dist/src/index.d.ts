import UID from "./lib/universal.identity";
import { CoreNet } from "./lib/corenet/index";
import { AppContextOptsLogging, AppContextOptsMountCore, AppContextOptsSettings } from "./lib/context";
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
export default function create$kernel(args: KernelArgs): Promise<import("../dist/lib/context").AppContext>;
declare const UUID: typeof UID;
declare const Request: typeof RequestState;
declare const Response: typeof BasicResponse;
export { UnhandledReponse, NotFound, PaginatedResponse, Response, //depricated
BasicResponse, EmptyResponse, FailedResponse, IHttp, ISocket, ISocketMount, ICore, IMount, IBatchHttp, ISub, IJob, CoreNet, Request, //depricated
RequestState, NoResponse, UUID, UID, };
