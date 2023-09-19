import { IHandler, RouteStat } from "../../handlers/BaseHander";
import { ICoreRouteHandler } from "../../handlers/ICore";
export declare const addICoreRoute: (stat: RouteStat, icore: IHandler<ICoreRouteHandler>) => Promise<false | undefined>;
