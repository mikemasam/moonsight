import { Request, Response, Router } from "express";
import { IHttpRouteHandler } from "../../handlers/IHttp";
import { HttpRequest, HttpResponse, IHandler, RouteStat, iRouteHandler } from "../../handlers/BaseHander";
export declare const notFoundRouter: () => (((_req: Request, _res: Response, next: () => void) => void) | ((req: HttpRequest, res: HttpResponse) => void))[];
export declare const RouteHandler: (handler: iRouteHandler, stat: RouteStat | string) => (req: HttpRequest, res: HttpResponse) => void;
export declare const addIHttpRoute: (router: Router, stat: RouteStat, ihttp: IHandler<IHttpRouteHandler>) => Promise<false | undefined>;
export declare const cleanRoutePath: (file: string) => string;
