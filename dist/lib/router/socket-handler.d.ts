import { IHandler, ISocketMountRoute, RouteStat } from "../../handlers/BaseHander";
import { ISocketRouteHandler } from "../../handlers/ISocket";
export declare const addISocketRoute: (stat: RouteStat, isocket: IHandler<ISocketRouteHandler>) => Promise<false | undefined>;
export declare const addISocketMount: (stat: RouteStat, isocketmount: IHandler<ISocketMountRoute>) => Promise<void>;
