import { CoreRouteHandler, IHandler, IMiddlewareConfig, SocketRequest, SocketResponse } from "./BaseHander";
export type ICoreRoute = (req: SocketRequest, res: SocketResponse) => void;
export type ICoreRouteHandler = [ICoreRoute, IMiddlewareConfig[] | string[]];
export default function ICore(handler: CoreRouteHandler, middlewares: IMiddlewareConfig[] | string[]): IHandler<ICoreRouteHandler>;
