import { IHandler, IMiddlewareConfig, SocketRequest, SocketResponse, iSocketHandler } from "./BaseHander";
type ISocketConfig = {
    minVersion: string | undefined;
};
export type ISocketRoute = (req: SocketRequest, res: SocketResponse) => void;
export type ISocketRouteHandler = [
    ISocketRoute,
    IMiddlewareConfig[] | string[]
];
export default function ISocket(handler: iSocketHandler, middlewares: IMiddlewareConfig[] | string[], config?: ISocketConfig): IHandler<ISocketRouteHandler>;
export {};
