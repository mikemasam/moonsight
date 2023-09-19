import { Request, Response, Router } from "express";
import { RouteStat } from "./index";
import { IHttpRouteHandler } from "../../handlers/IHttp";
import { HttpRequest, HttpResponse, IHandler, iRouteHandler } from "../../handlers/BaseHander";
export declare const notFoundRouter: () => Promise<(((_req: Request, _res: Response, next: () => void) => void) | ((req: HttpRequest, res: HttpResponse) => void))[]>;
export declare const RouteHandler: (handler: iRouteHandler, stat: RouteStat | string) => Promise<(req: HttpRequest, res: HttpResponse) => void>;
export declare const addIHttpRoute: (router: Router, stat: RouteStat, ihttp: IHandler<IHttpRouteHandler>) => Promise<false | undefined>;
export declare const cleanRoutePath: (file: string) => string;
