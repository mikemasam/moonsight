/// <reference types="node" />
import { Request, Response } from "express";
import { RouteStat } from "../lib/router";
import { Socket } from "socket.io";
import { Handshake } from "socket.io/dist/socket";
import { ParsedUrlQuery } from "querystring";
import { AppState } from "../lib/AppState";
import AppResponse from "../responders/lib/AppResponse";
export type NetRequest = HttpRequest | SocketRequest;
export type NetResponse = HttpResponse | SocketResponse;
export type ISocketMountRoute = (req: SocketRequest, res: SocketResponse, next: (err?: Error) => void) => void;
export type IMiddlewareConfig = {
    name: string;
};
export type ISocketMountConfig = {
    minVersion: string | undefined;
};
export type IHandler<T> = {
    (stat: RouteStat): T;
    __ihandler: string;
};
export type iSocketHandler = (req: SocketRequest, res: SocketResponse, appState: AppState) => Promise<AppResponse | undefined>;
export type iRouteHandler = (req: Request, res: Response, appState: AppState) => Promise<AppResponse | undefined>;
export type CoreRouteHandler = (req: SocketRequest, res: SocketResponse, appState: AppState) => Promise<AppResponse | undefined>;
export type ISocketMountRouteHandler = (req: SocketRequest, appState: AppState) => Promise<void>;
export type IMiddlewareHandler = (appState: AppState, req: Request | SocketRequest, res: Response | SocketResponse, args: any, callback?: (hook: any) => void) => Promise<AppResponse | void>;
export interface HttpRequest extends Request {
    locals: {
        [key: string]: any;
    };
    __type: "ihttp";
}
export interface HttpResponse extends Response {
    __locals: {
        hooks: ((data: any) => Promise<void>)[];
        startTime: number;
    };
}
export interface SocketRequestRaw extends Socket {
    locals: {
        [key: string]: any;
    };
}
export type SocketRequest = {
    socket: SocketRequestRaw;
    ip: string;
    originalUrl: string;
    method: string;
    body: any;
    __type: string;
    handshake: Handshake;
    query: ParsedUrlQuery;
};
export type SocketResponse = {
    fn: (arg: any) => void;
    __locals: {
        hooks: ((data: any) => Promise<void>)[];
        startTime: number;
    };
};
export type RouteResponseOpts = {
    message?: string;
    status?: number;
};
export type RouteResponseDataOpts = {
    data?: any;
    message?: string;
    status?: number;
};
export type ResponseData = {
    message: string;
    status: number;
    data: Object;
    [key: string]: any;
};
export interface RequestLog {
    path: string;
    startTime: number;
}
export interface ResponseLog {
    method: string;
    ip: string;
    url: string;
    status: number;
    endTime: number;
}
export type RouteLog = {
    err?: Error;
};
