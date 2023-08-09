import { getContext } from "../context";
import { RouteStat } from "./index";
import logger from "../logger";
import {
  IHandler,
  IMiddlewareHandler,
  ISocketMountRoute,
  SocketRequest,
  SocketResponse,
} from "../../handlers/BaseHander";
import { ISocketRoute, ISocketRouteHandler } from "../../handlers/ISocket";
import { Socket } from "socket.io";
import CreateAppState from "../AppState";
import UnhandledReponse from "../../responders/UnhandledReponse";
import {
  makeSocketRequest,
  makeSocketResponse,
  moveSocketToRequestRaw,
} from "../socket/utils";
const AsyncFn = (async () => null).constructor;

type MiddlewareRouteStack = (
  req: SocketRequest,
  res: SocketResponse,
  next: (req: SocketRequest, res: SocketResponse) => void
) => Promise<any>;

const middlewaresHandler = (
  handler: IMiddlewareHandler,
  stat: RouteStat,
  args: Object
): MiddlewareRouteStack => {
  return async (
    req: SocketRequest,
    res: SocketResponse,
    next: (req: SocketRequest, res: SocketResponse) => void
  ): Promise<any> => {
    const log = {
      path: stat.location,
      opts: getContext().opts,
      startTime: Date.now(),
    };
    return handler(CreateAppState(), req, res, args)
      .then((_r) => (_r ? _r.json(log, req, res).socket() : next(req, res)))
      .catch((err: Error) =>
        UnhandledReponse(err).json(log, req, res).socket()
      );
  };
};

export const addISocketRoute = async (
  stat: RouteStat,
  isocket: IHandler<ISocketRouteHandler>
) => {
  if (!isocket) return false;
  if (!isocket.__ihandler)
    throw `[KernelJs] ~ ${stat.fullPath} socket route doesn't return async ISocket handler.`;
  const [handler, middlewares] = isocket(stat);
  const attachs = [];
  const attached = [];
  for (const middleware of middlewares) {
    const name = typeof middleware == "string" ? middleware : middleware?.name;
    const md = getContext().net.middlewares.find((m) => m.name == name);
    if (md == null) continue;
    if (md?.action instanceof AsyncFn === false)
      throw `[KernelJs] ~ ISocket Unknown middleware [${name}] ~ ${stat.location}`;
    const args = typeof name == "string" ? {} : middleware;
    const _fn = middlewaresHandler(md.action, stat, args);
    attachs.push(_fn);
    attached.push(name);
  }
  const endpoint = await cleanRoutePath(stat.location);
  logger.kernel(
    `ISocket: ${stat.location}`,
    endpoint,
    `[${attached.join(",")}]`
  );
  queueEndpoint(endpoint, handler, attachs);
};

const queueEndpoint = async (
  endpoint: string,
  handler: ISocketRoute,
  middlewares: MiddlewareRouteStack[]
) => {
  getContext().net.socketIO.on("connection", (_socket: Socket) => {
    const socket = moveSocketToRequestRaw(_socket);
    socket.on(endpoint, (data, fn) => {
      const req: SocketRequest = makeSocketRequest(
        socket,
        endpoint,
        "isocket",
        "isocket",
        data
      );
      const res: SocketResponse = makeSocketResponse(fn);
      const mds = [...middlewares, handler];
      const run = (req: SocketRequest, res: SocketResponse) =>
        mds.shift()!(req, res, run);
      return run(req, res);
    });
  });
};

//socket io middleware
export const addISocketMount = async (
  stat: RouteStat,
  isocketmount: IHandler<ISocketMountRoute>
) => {
  const originalUrl = await cleanRoutePath(stat.location);
  const handler = isocketmount(stat);
  logger.byType("socketmount", `[KernelJs] ~ ISocketMount: ${stat.location}`);
  getContext().net.socketIO.use(
    (_socket: Socket, next: (err?: Error) => void) => {
      const socket = moveSocketToRequestRaw(_socket);
      const req: SocketRequest = makeSocketRequest(
        socket,
        originalUrl,
        "isocketmount",
        "isocketmount",
        null
      );
      const fn = (response: any) => {
        if (parseInt(String(req.query?.explain)) === 0) {
          //for buggy socket implemetation
          const err = new Error(`${response.message} --x`);
          next(err);
        } else {
          const err: any = new Error(response.message);
          err.data = response.data;
          //err.status = response.status;
          next(err);
        }
      };
      const res: SocketResponse = makeSocketResponse(fn);
      handler(req, res, next);
    }
  );
};
//console.log(handler);

const cleanRoutePath = async (file: string) => {
  return file
    .replace("/index.js", "")
    .replace("/index.ts", "")
    .replace(".js", "")
    .replace(".ts", "")
    .split("/")
    .join(":");
};
