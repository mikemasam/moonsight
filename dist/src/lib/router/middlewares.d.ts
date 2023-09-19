import { IMiddlewareHandler } from "../../handlers/BaseHander";
export declare const loadMiddlewares: (location: string) => Promise<IHttpMiddleware[]>;
export type IHttpMiddleware = {
    name: string;
    action: IMiddlewareHandler;
};
