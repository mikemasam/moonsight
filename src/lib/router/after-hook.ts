import {
  HttpResponse,
  ResponseStatus,
  SocketResponse,
} from "../../handlers/BaseHander";

const addHook = (res: HttpResponse | SocketResponse) => {
  return (hook: (data: any, status: ResponseStatus) => Promise<void>) => {
    res.__locals.hooks.push(hook);
  };
};

export default addHook;
