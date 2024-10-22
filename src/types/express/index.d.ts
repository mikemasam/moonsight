import { HttpRequestUtils, ResponseStatus } from "../../handlers/BaseHander";
import { AppState } from "../../lib/AppState";
import { FailedResponse } from "../../responders/FailedResponse";
import { OkResponse } from "../../responders/OkResponse";
import { RequestState } from "../../responders/RequestState";

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

export interface HttpRequest extends express.Request {
  _tmp?: string;
  locals: { [key: string]: any };
  utils: HttpRequestUtils;
  __type: "ihttp";
  state: () => RequestState;
  appState: () => AppState;
}
export interface HttpResponse extends express.Response {
  Ok: OkResponse;
  Failed: FailedResponse;
  __locals: {
    hooks: ((data: any, status: ResponseStatus) => Promise<void>)[];
    startTime: number;
  };
}
