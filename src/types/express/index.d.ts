import { HttpRequestUtils, RequestState, ResponseStatus } from '../../';
import { AppState } from '../../lib/AppState';
import { OkResponse } from '../../responders/OkResponse';
import { FailedResponse } from '../../responders/FailedResponse';

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
