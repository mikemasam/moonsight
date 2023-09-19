import { ISocketMountConfig, ISocketMountRoute, ISocketMountRouteHandler } from "./BaseHander";
import { RouteStat } from "../lib/router/index";
export default function ISocketMount(handler: ISocketMountRouteHandler, _?: unknown, config?: ISocketMountConfig): {
    (stat: RouteStat): ISocketMountRoute;
    __ihandler: string;
};
