import { AppContext } from "../../../lib/context";
export default function mount(ctx: AppContext, opts: any): Promise<void>;
export declare const ihttp: import("../../../dist/handlers/BaseHander").IHandler<import("../../../dist/handlers/IHttp").IHttpRouteHandler>;
export declare const mobileitems: import("../../../dist/handlers/BaseHander").IHandler<import("../../../dist/handlers/ISocket").ISocketRouteHandler>;
export declare const icore: import("../../../dist/handlers/BaseHander").IHandler<import("../../../dist/handlers/ICore").ICoreRouteHandler>;
