import { ISocketMountConfig, ISocketMountRoute, ISocketMountRouteHandler, RouteStat } from "./BaseHander";
export default function ISocketMount(handler: ISocketMountRouteHandler, _?: unknown, config?: ISocketMountConfig): {
    (stat: RouteStat): ISocketMountRoute;
    __ihandler: string;
};
