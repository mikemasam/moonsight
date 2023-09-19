import { RouteStat } from "./index";
import { IHandler, ISocketMountRoute } from "../../handlers/BaseHander";
import { ISocketRouteHandler } from "../../handlers/ISocket";
export declare const addISocketRoute: (stat: RouteStat, isocket: IHandler<ISocketRouteHandler>) => Promise<false | undefined>;
export declare const addISocketMount: (stat: RouteStat, isocketmount: IHandler<ISocketMountRoute>) => Promise<void>;
