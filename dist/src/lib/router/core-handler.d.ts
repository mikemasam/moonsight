import { IHandler } from "../../handlers/BaseHander";
import { RouteStat } from "./index";
import { ICoreRouteHandler } from "../../handlers/ICore";
export declare const addICoreRoute: (stat: RouteStat, icore: IHandler<ICoreRouteHandler>) => Promise<false | undefined>;
