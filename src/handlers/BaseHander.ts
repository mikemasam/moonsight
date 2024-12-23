import { Socket } from "socket.io";
import { ParsedUrlQuery } from "querystring";
import { AppState } from "../lib/AppState";
import AppResponse from "../responders/lib/AppResponse";
import z from "zod";
import { OkResponse } from "../responders/OkResponse";
import { FailedResponse } from "../responders/FailedResponse";
import { RequestState } from "../responders/RequestState";
import { Request, Response, Router } from "express";
//import { Request, Response } from "express-serve-static-core";
export type SocketRequestRaw = Socket;
/*
declare global {
  namespace Express {
    export interface Request {
      _tmp?: string;
      locals: { [key: string]: any };
      utils: HttpRequestUtils;
      __type: "ihttp";
      state: () => RequestState;
      appState: () => AppState;
    }
    export interface Response {
      Ok: OkResponse;
      Failed: FailedResponse;
      __locals: {
        hooks: ((data: any, status: ResponseStatus) => Promise<void>)[];
        startTime: number;
      };
    }
  }
}
*/

export interface ParamsDictionary {
    [key: string]: string;
}
export interface HttpRequest extends Request {
  body: Record<string, any>;
  headers: Record<string, any>;
  header(name: 'set-cookie'): string[] | undefined;
  header(name: string): string | undefined;
  query: Record<string, any>;
  params: ParamsDictionary;
  _tmp?: string;
  locals: { [key: string]: any };
  utils: HttpRequestUtils;
  __type: "ihttp";
  state: () => RequestState;
  appState: () => AppState;
}
export interface HttpResponse extends Response {
  Ok: OkResponse;
  Failed: FailedResponse;
  __locals: {
    hooks: ((data: any, status: ResponseStatus) => Promise<void>)[];
    startTime: number;
  };
}
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

export interface ResponseStatus {
  success: boolean;
  message: string;
}

export type SocketRequest = {
  socket: SocketRequestRaw | null;
  handshake: any | null;
  query: ParsedUrlQuery | null;
  ip: string;
  originalUrl: string;
  method: string;
  body: any;
  __type: string;
  state: () => RequestState;
  appState: () => AppState;
};

export type SocketResponse = {
  fn?: (arg: any) => void;
  ok: OkResponse;
  failed: FailedResponse;
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
  ip: string | undefined;
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
  soft?: boolean;
};


declare module "socket.io" {
  export interface Socket {
    locals: { [key: string]: any };
  }
}
declare module "socket.io-client" {
  export interface Socket {
    locals: { [key: string]: any };
  }
}
