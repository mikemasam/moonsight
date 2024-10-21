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
import CreateAppState, { AppState } from "../AppState";
import NotFound from "../../responders/NotFound";
import EmptyResponse from "../../responders/EmptyResponse";
import UnhandledReponse from "../../responders/UnhandledReponse";
import HttpUtils from "../../utils/http";
import addHook from "./after-hook";
import AppResponse from "../../responders/lib/AppResponse";
import OkResponse from "../../responders/Response";
import FailedResponse from "../../responders/FailedResponse";
import CreateRequestState, { RequestState } from "../../responders/Request";

export const notFoundRouter = () => {
  const handler = RouteHandler(async () => NotFound(), "/");
  return [prepareHttpReq([]), handler];
};

export const RouteHandler = (
  handler: iRouteHandler,
  stat: RouteStat | string,
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
  args: any,
) => {
  return (req: HttpRequest, res: HttpResponse, next: () => void) => {
    logger.byType(
      "debug",
      "start middleware processing url: ",
      req.url,
      ", name: ",
      stat.path,
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
          stat.path,
        );
        if (_r) return _r.json(log, req, res).http();
        next();
      })
      .catch((_r: any) => {
        logger.byType(
          "debug",
          "end middleware processing url:",
          req.url,
          ", name: ",
          stat.path,
          ", error:",
          _r,
        );
        const $rs: AppResponse = _r.responder ? _r : UnhandledReponse(_r);
        $rs.json(log, req, res).http();
      });
  };
};

export const addIHttpRoute = async (
  router: Router,
  stat: RouteStat,
  ihttp: IHandler<IHttpRouteHandler>,
) => {
  if (!ihttp) return false;
  if (!ihttp.__ihandler)
    throw new Error(`[KernelJs] ~ ${stat.fullPath} http route doesn't return async IHttp handler.`);
  const [config, handler, middlewares = []] = ihttp(stat);
  const attachs: any = [];
  const attached: any = [];
  for (const middleware of middlewares) {
    const name = typeof middleware == "string" ? middleware : middleware?.name;
    const md = getContext().net.middlewares.find((m) => m.name == name);
    if (md == null) {
      throw new Error(`[KernelJs] ~ Unknown middleware [${name}] ~ ${stat.location}`);
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
    `[${attached.join(",")}]`,
  );
  const m = config.method as Method;
  if (!m) {
    throw new Error(`[KernelJs] ~ invalid config ~ ${stat.location}`);
  }
  router[m](
    `/${endpoint}`,
    prepareHttpReq(attachs),
    attachs as any,
    handler as any,
  );
};
type Method = "post" | "get" | "all" | "delete" | "put";

const prepareHttpReq = (attachs: any) => {
  return (_req: Request, _res: Response, next: () => void) => {
    _req.state = () => new RequestState(_req);
    _req.appState = () => new AppState();
    logger.byType("debug", "prepare req: ", _req.url, ", attachs: ", attachs);
    //const req = _req as HttpRequest;
    //const res = _res as HttpResponse;
    _res.ok = OkResponse;
    _res.failed = FailedResponse;
    _req.utils = HttpUtils(_req, _res as HttpResponse);
    _req.__type = "ihttp";
    _req.locals = {};
    _res.__locals = {
      hooks: [],
      startTime: Date.now(),
    };
    return next();
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
