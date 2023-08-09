import { Request, Response, Router } from "express";
import { getContext } from "../context";
import { RouteStat } from "./index";
import logger from "../logger";
import { IHttpRouteHandler } from "../../handlers/IHttp";
import {
  HttpRequest,
  HttpResponse,
  IHandler,
  IMiddlewareHandler,
  iRouteHandler,
} from "../../handlers/BaseHander";
import CreateAppState from "../AppState";
import NotFound from "../../responders/NotFound";
import EmptyResponse from "../../responders/EmptyResponse";
import UnhandledReponse from "../../responders/UnhandledReponse";
const AsyncFn = (async () => null).constructor;

export const notFoundRouter = async () => {
  const handler = await RouteHandler(async () => NotFound(), "/");
  return [prepareHttpReq(), handler];
};

export const RouteHandler = async (
  handler: iRouteHandler,
  stat: RouteStat | string
) => {
  return (req: HttpRequest, res: HttpResponse) => {
    const log = {
      path: typeof stat == "string" ? stat : stat.location,
      opts: getContext().opts,
      startTime: Date.now(),
    };
    handler(req, res, CreateAppState())
      .then((_r) => _r || EmptyResponse())
      .catch((_r: Error) => UnhandledReponse(_r))
      .then((_r) => _r.json(log, req, res).http());
  };
};

const middlewaresHandler = async (
  handler: IMiddlewareHandler,
  stat: RouteStat,
  args: any
) => {
  return (req: HttpRequest, res: HttpResponse, next: () => void) => {
    //TODO: use locals:_lifetime for context & stat & startTime
    const log = {
      path: stat.location,
      opts: getContext().opts,
      startTime: Date.now(),
    };
    handler(CreateAppState(), req, res, args, addHook(res))
      .then((_r) => (_r ? _r.json(log, req, res) : next()))
      .catch((err: Error) => UnhandledReponse(err).json(log, req, res));
  };
};

export const addIHttpRoute = async (
  router: Router,
  stat: RouteStat,
  ihttp: IHandler<IHttpRouteHandler>
) => {
  if (!ihttp) return false;
  if (!ihttp.__ihandler)
    throw `[KernelJs] ~ ${stat.fullPath} http route doesn't return async IHttp handler.`;
  const [handler, middlewares = []] = ihttp(stat);
  const attachs = [];
  const attached = [];
  for (const middleware of middlewares) {
    const name = typeof middleware == "string" ? middleware : middleware?.name;
    const md = getContext().net.middlewares.find((m) => m.name == name);
    if (md == null) continue;
    if (md?.action instanceof AsyncFn === false)
      throw `[KernelJs] ~ Unknown middleware [${name}] ~ ${stat.location}`;
    const args = typeof middleware == "string" ? {} : middleware;
    const _fn = await middlewaresHandler(md.action, stat, args);
    attached.push(name);
    attachs.push(_fn);
  }
  const endpoint = cleanRoutePath(stat.file);
  logger.byType(
    "http",
    `[KernelJs] ~ IHttp: ${stat.location}`,
    stat.path,
    `[${attached.join(",")}]`
  );
  router.all(`/${endpoint}`, prepareHttpReq(), attachs as any, handler as any);
};

const prepareHttpReq = () => {
  return (_req: Request, _res: Response, next: () => void) => {
    const req = _req as HttpRequest;
    const res = _res as HttpResponse;
    req.__type = "ihttp";
    res.__locals = {
      hooks: [],
      startTime: Date.now(),
    };
    return next();
  };
};

const addHook = (res: HttpResponse) => {
  return (hook: (data: any) => Promise<void>) => {
    res.__locals.hooks.push(hook);
  };
};

export const cleanRoutePath = (file: string) => {
  if (file == "index.js") return "";
  let path = file
    .replace("/index.js", "")
    .replace("index.js", "")
    .replace("/index.ts", "")
    .replace("index.ts", "")
    .replace(".js", "")
    .replace(".ts", "")
    .replace("[", ":")
    .replace("]", "");

  return path;
};
