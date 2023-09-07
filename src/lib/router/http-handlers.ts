import { Request, Response, Router } from "express";
import { getContext } from "../context";
import logger from "../logger";
import { IHttpRouteHandler } from "../../handlers/IHttp";
import {
  HttpRequest,
  HttpResponse,
  IHandler,
  IHttpMiddlewareHandler,
  ResponseStatus,
  RouteStat,
  iRouteHandler,
} from "../../handlers/BaseHander";
import CreateAppState from "../AppState";
import NotFound from "../../responders/NotFound";
import EmptyResponse from "../../responders/EmptyResponse";
import UnhandledReponse from "../../responders/UnhandledReponse";
import HttpUtils from "../../utils/http";

export const notFoundRouter = () => {
  const handler = RouteHandler(async () => NotFound(), "/");
  return [prepareHttpReq([]), handler];
};

export const RouteHandler = (
  handler: iRouteHandler,
  stat: RouteStat | string
) => {
  return (req: HttpRequest, res: HttpResponse) => {
    const log = {
      path: typeof stat == "string" ? stat : stat.location,
      ctx: getContext(),
      startTime: Date.now(),
    };
    handler(req, res, CreateAppState())
      .then((_r) => _r || EmptyResponse())
      .catch((_r: any) => (_r.responder ? _r : UnhandledReponse(_r)))
      .then((_r) => _r.json(log, req, res).http());
  };
};

const middlewaresHandler = async (
  handler: IHttpMiddlewareHandler,
  stat: RouteStat,
  args: any
) => {
  return (req: HttpRequest, res: HttpResponse, next: () => void) => {
    logger.byType(
      "debug",
      "start middleware processing url: ",
      req.url,
      ", name: ",
      stat.path
    );
    //TODO: use locals:_lifetime for context & stat & startTime
    const log = {
      path: stat.location,
      opts: getContext().opts,
      startTime: Date.now(),
    };
    handler(CreateAppState(), req, res, args, addHook(res))
      .then((_r) => {
        logger.byType(
          "debug",
          "end middleware processing, ",
          "failed: ",
          !!_r,
          ", url: ",
          req.url,
          "name: ",
          stat.path
        );
        if (_r) _r.json(log, req, res).http();
        next();
      })
      .catch((err: Error) => {
        logger.byType(
          "debug",
          "end middleware processing url:",
          req.url,
          ", name: ",
          stat.path,
          ", error:",
          err
        );
        return UnhandledReponse(err).json(log, req, res).http();
      });
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
  const [config, handler, middlewares = []] = ihttp(stat);
  const attachs = [];
  const attached = [];
  for (const middleware of middlewares) {
    const name = typeof middleware == "string" ? middleware : middleware?.name;
    const md = getContext().net.middlewares.find((m) => m.name == name);
    if (md == null) {
      throw `[KernelJs] ~ Unknown middleware [${name}] ~ ${stat.location}`;
    }
    const args = typeof middleware == "string" ? {} : middleware;
    const _fn = await middlewaresHandler(md.action, stat, args);
    attached.push(name);
    attachs.push(_fn);
  }
  const endpoint = cleanRoutePath(stat.file);
  logger.byType(
    "http",
    `IHttp: ${stat.location}`,
    stat.path,
    `[${attached.join(",")}]`
  );
  const m = config.method as Method;
  router[m](
    `/${endpoint}`,
    prepareHttpReq(attachs),
    attachs as any,
    handler as any
  );
};
type Method = "post" | "get" | "all" | "delete" | "put";

const prepareHttpReq = (attachs: any) => {
  return (_req: Request, _res: Response, next: () => void) => {
    logger.byType("debug", "prepare req: ", _req.url, ", attachs: ", attachs);
    const req = _req as HttpRequest;
    const res = _res as HttpResponse;
    req.utils = HttpUtils(req, res);
    req.__type = "ihttp";
    req.locals = {};
    res.__locals = {
      hooks: [],
      startTime: Date.now(),
    };
    return next();
  };
};

const addHook = (res: HttpResponse) => {
  return (hook: (data: any, status: ResponseStatus) => Promise<void>) => {
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
