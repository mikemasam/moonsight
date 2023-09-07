import { Socket } from "socket.io";
import {
  IHandler,
  IMiddlewareConfig,
  ISocketMiddlewareHandler,
  RouteStat,
  SocketRequest,
  SocketResponse,
} from "../../handlers/BaseHander";
import { getContext } from "../context";
import logger from "../logger";
import { ICoreRoute, ICoreRouteHandler } from "../../handlers/ICore";
import CreateAppState from "../AppState";
import UnhandledReponse from "../../responders/UnhandledReponse";
import AppResponse from "../../responders/lib/AppResponse";
import {
  makeSocketRequest,
  makeSocketResponse,
  moveSocketToRequestRaw,
} from "../socket/utils";
const AsyncFn = (async () => null).constructor;
type MiddlewareRouteStack = (
  req: SocketRequest,
  res: SocketResponse,
  next: (req: SocketRequest, res: SocketResponse) => AppResponse | void
) => Promise<any>;

const middlewaresHandler = async (
  handler: ISocketMiddlewareHandler,
  stat: RouteStat,
  args: any
): Promise<MiddlewareRouteStack> => {
  return async (
    req: SocketRequest,
    res: SocketResponse,
    next: (req: SocketRequest, res: SocketResponse) => AppResponse | void
  ) => {
    const log = {
      path: stat.location,
      ctx: getContext(),
      startTime: Date.now(),
    };
    return handler(CreateAppState(), req, res, args)
      .then((_r) => (_r ? _r.json(log, req, res).socket() : next(req, res)))
      .catch((err: Error) =>
        UnhandledReponse(err).json(log, req, res).socket()
      );
  };
};

export const addICoreRoute = async (
  stat: RouteStat,
  icore: IHandler<ICoreRouteHandler>
) => {
  if (!icore) return false;
  if (!icore.__ihandler)
    throw `[KernelJs] ~ ${stat.fullPath} core route doesn't return async ICore handler.`;
  const [handler, middlewares] = icore(stat);
  const attachs = [];
  for (const middleware of middlewares) {
    const name = typeof middleware == "string" ? middleware : middleware.name;
    const md = getContext().net.middlewares.find((m) => m.name == name);
    if (!md) continue;
    if (md?.action instanceof AsyncFn === false)
      throw `[KernelJs] ~ ICore Unknown middleware [${name}] ~ ${stat.location}`;
    const args = typeof name == "string" ? {} : middleware;
    const _fn = await middlewaresHandler(
      md.action as ISocketMiddlewareHandler,
      stat,
      args
    );
    attachs.push(_fn);
  }
  const endpoint = await cleanRoutePath(stat.location);
  logger.byType("core", `${stat.location}`, endpoint);
  if (getContext().opts.mountCore?.mount) {
    handleLocalCoreNet(endpoint, handler, attachs);
  } else {
    handleRemoteCoreNet(endpoint, handler, attachs);
  }
};

const handleLocalCoreNet = async (
  endpoint: string,
  handler: ICoreRoute,
  middlewares: MiddlewareRouteStack[]
) => {
  const originalUrl = endpoint;
  getContext().net.coreIO!.on("connection", (_socket: Socket) => {
    _socket.on(endpoint, (data: any, fn) => {
      const { body } = data;
      const socket = moveSocketToRequestRaw(_socket);
      const req = makeSocketRequest(
        socket,
        originalUrl,
        "icore",
        "icore",
        body
      );
      const res = makeSocketResponse(fn);
      const mds = [...middlewares, handler];
      const run = (req: SocketRequest, res: SocketResponse) =>
        mds.shift()?.(req, res, run);
      run(req, res);
    });
  });
};

const handleRemoteCoreNet = async (
  endpoint: string,
  handler: ICoreRoute,
  middlewares: MiddlewareRouteStack[]
) => {
  const originalUrl = endpoint;
  getContext().events.on("kernel.corenet.connection", (_socket: Socket) => {
    //console.log("remote route added", socket.io.opts.hostname);
    _socket.on(endpoint, (body, fn) => {
      const socket = moveSocketToRequestRaw(_socket);
      //const { body, channel } = data;
      const req = makeSocketRequest(
        socket,
        originalUrl,
        "icore",
        "icore",
        body
      );
      const res = makeSocketResponse(fn);
      const mds = [...middlewares, handler];
      const run = (req: SocketRequest, res: SocketResponse) =>
        mds.shift()?.(req, res, run);
      run(req, res);
    });
  });
};

const cleanRoutePath = async (file: string) => {
  return file
    .replace("/index.js", "")
    .replace("/index.ts", "")
    .replace(".ts", "")
    .replace(".js", "")
    .split("/")
    .join(":");
};
