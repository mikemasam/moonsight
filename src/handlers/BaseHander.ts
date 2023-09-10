import { Request, Response, Router } from "express";
import { AppContext } from "../lib/context";
import { Socket } from "socket.io";
import { Handshake } from "socket.io/dist/socket";
import { ParsedUrlQuery } from "querystring";
import { AppState } from "../lib/AppState";
import AppResponse from "../responders/lib/AppResponse";
import z from "zod";

export type NetRequest = HttpRequest | SocketRequest;
export type NetResponse = HttpResponse | SocketResponse;

export type ISocketMountRoute = (
  req: SocketRequest,
  res: SocketResponse,
  next: (err?: Error) => void,
) => void;

export type ISocketMountConfig = {
  minVersion: string | undefined;
};

export type IHandler<T> = {
  (stat: RouteStat): T;
  __ihandler: string;
};

export type iSocketHandler = (
  req: SocketRequest,
  res: SocketResponse,
  appState: AppState,
) => Promise<AppResponse | void>;
export type iRouteHandler = (
  req: HttpRequest,
  res: HttpResponse,
  appState: AppState,
) => Promise<AppResponse | void>;

export type CoreRouteHandler = (
  req: SocketRequest,
  res: SocketResponse,
  appState: AppState,
) => Promise<AppResponse | void>;

export type ISocketMountRouteHandler = (
  req: SocketRequest,
  appState: AppState,
) => Promise<void>;

//export type IMiddlewareHandler = (
//  ctx: AppContext,
//  req: Request,
//  res: Response
//) => void;
//
export type IHttpMiddlewareHandler = (
  appState: AppState,
  req: HttpRequest,
  res: HttpResponse,
  args: any,
  callback: (hook: (data: any, status: ResponseStatus) => any) => void,
) => Promise<AppResponse | void>;
export type ISocketMiddlewareHandler = (
  appState: AppState,
  req: HttpRequest | SocketRequest,
  res: HttpResponse | SocketResponse,
  args: any,
  callback: (hook: (data: any, status: ResponseStatus) => any) => void,
) => Promise<AppResponse | void>;

export interface HttpRequestUtils {
  parseBody: <T>(schema: z.ZodType<T>) => T;
}
export interface HttpRequest extends Request {
  locals: { [key: string]: any };
  utils: HttpRequestUtils;
  __type: "ihttp";
}

export interface ResponseStatus {
  success: boolean;
  message: string;
}
export interface HttpResponse extends Response {
  __locals: {
    hooks: ((data: any, status: ResponseStatus) => Promise<void>)[];
    startTime: number;
  };
}

export interface SocketRequestRaw extends Socket {
  locals: { [key: string]: any };
}

export type SocketRequest = {
  socket: SocketRequestRaw | null;
  handshake: Handshake | null;
  query: ParsedUrlQuery | null;
  ip: string;
  originalUrl: string;
  method: string;
  body: any;
  __type: string;
};

export type SocketResponse = {
  fn: (arg: any) => void;
  __locals: {
    hooks: ((data: any, status: ResponseStatus) => Promise<void>)[];
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
export interface IMiddlewareConfig {
  name: string;
  [key: string]: any;
}
export type IAnyMiddlewareRoute = {
  name: string;
  action: IHttpMiddlewareHandler | ISocketMiddlewareHandler;
};

export type MiddlewareStat = {
  file: string;
  fullPath: string;
  isDirectory: boolean;
  isFile: boolean;
};
export interface RouteStat {
  pos: number;
  file: string;
  fullPath: string;
  isDirectory: boolean;
  isFile: boolean;
  location: string;
  dir: string;
  path: string;
  router: Router;
  dynamic_route: boolean;
}

export interface CoreResponse<T> {
  status: number;
  success: boolean;
  message: string;
  data: T;
}
export interface AppResponsePayload {
  data: any;
  status: number;
  message: string;
}

export type QueueOptions = {
  wait: boolean;
};
