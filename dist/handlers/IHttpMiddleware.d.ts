import { IHandler, IHttpMiddlewareHandler } from "./BaseHander";
export default function IHttpMiddleware(handler: IHttpMiddlewareHandler): IHandler<IHttpMiddlewareHandler>;
