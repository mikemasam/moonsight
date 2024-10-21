import * as express from "express";
import { HttpRequestUtils, ResponseStatus } from "../handlers/BaseHander";
import { AppState } from "../lib/AppState";
import { FailedResponse } from "../responders/FailedResponse";
import { RequestState } from "../responders/Request";
import { OkResponse } from "../responders/Response";

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
      ok: OkResponse;
      failed: FailedResponse;
      __locals: {
        hooks: ((data: any, status: ResponseStatus) => Promise<void>)[];
        startTime: number;
      };
    }
  }
}
