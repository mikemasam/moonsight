import { HttpRequestUtils, RequestState, ResponseStatus } from '..';
import { AppState } from '../lib/AppState';
import { OkResponse } from '../responders/OkResponse';
import { FailedResponse } from '../responders/FailedResponse';
//import { Express } from "express-serve-static-core";
//import { Express, Request, Response } from "express";


declare module "express-serve-static-core" {
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
