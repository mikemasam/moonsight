import { HttpRequest, HttpResponse, IHandler, IMiddlewareConfig, iRouteHandler } from "./BaseHander";
type IHttpMethod = "post" | "get" | "all" | "put" | "delete";
type IHttpConfig = {
    minVersion?: string;
    method?: IHttpMethod;
};
type IHttpRoute = (req: HttpRequest, res: HttpResponse) => void;
export type IHttpRouteHandler = [
    IHttpConfig,
    IHttpRoute,
    (IMiddlewareConfig | string)[]
];
type Middlewares = (string | IMiddlewareConfig)[];
declare const IHttpPost: (handler: iRouteHandler, middlewares: Middlewares, config?: IHttpConfig) => IHandler<IHttpRouteHandler>;
declare const IHttpGet: (handler: iRouteHandler, middlewares: Middlewares, config?: IHttpConfig) => IHandler<IHttpRouteHandler>;
declare const IHttpDelete: (handler: iRouteHandler, middlewares: Middlewares, config?: IHttpConfig) => IHandler<IHttpRouteHandler>;
declare const IHttpPut: (handler: iRouteHandler, middlewares: Middlewares, config?: IHttpConfig) => IHandler<IHttpRouteHandler>;
declare const IHttp: (handler: iRouteHandler, middlewares: Middlewares, config?: IHttpConfig) => IHandler<IHttpRouteHandler>;
export default IHttp;
export { IHttpPost, IHttpGet, IHttpPut, IHttpDelete };
