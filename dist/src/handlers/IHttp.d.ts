import { HttpRequest, HttpResponse, IHandler, iRouteHandler } from "./BaseHander";
type IHttpConfig = {
    minVersion?: string;
};
type IHttpRoute = (req: HttpRequest, res: HttpResponse) => void;
export type IHttpRouteHandler = [IHttpRoute, any[]];
export default function IHttp(handler: iRouteHandler, middlewares: string[], config?: IHttpConfig): IHandler<IHttpRouteHandler>;
export {};
