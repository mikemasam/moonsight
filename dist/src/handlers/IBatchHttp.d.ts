import { RouteStat } from "../lib/router/index";
import { HttpRequest, HttpResponse, IMiddlewareConfig } from "./BaseHander";
import { RequestState } from "../responders/Request";
import { AppState } from "../lib/AppState";
type BatchRouteBody<T> = {
    [key: string]: T;
};
type BatchRoute<T> = (body: BatchRouteBody<T>, reqState: RequestState, appState: AppState) => Promise<Object>;
export default function IBatchHttp(routes: {
    [key: string]: BatchRoute<string>;
}, middlewares: IMiddlewareConfig[]): {
    (stat: RouteStat): (IMiddlewareConfig[] | ((req: HttpRequest, res: HttpResponse) => import("../responders/lib/JsonResponder").default | undefined))[];
    __ihandler: string;
};
export {};
