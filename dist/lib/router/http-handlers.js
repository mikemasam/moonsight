"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cleanRoutePath = exports.addIHttpRoute = exports.RouteHandler = exports.notFoundRouter = void 0;
const context_1 = require("../context");
const logger_1 = __importDefault(require("../logger"));
const AppState_1 = __importDefault(require("../AppState"));
const NotFound_1 = __importDefault(require("../../responders/NotFound"));
const EmptyResponse_1 = __importDefault(require("../../responders/EmptyResponse"));
const UnhandledReponse_1 = __importDefault(require("../../responders/UnhandledReponse"));
const http_1 = __importDefault(require("../../utils/http"));
const after_hook_1 = __importDefault(require("./after-hook"));
const notFoundRouter = () => {
    const handler = (0, exports.RouteHandler)(async () => (0, NotFound_1.default)(), "/");
    return [prepareHttpReq([]), handler];
};
exports.notFoundRouter = notFoundRouter;
const RouteHandler = (handler, stat) => {
    return (req, res) => {
        const log = {
            path: typeof stat == "string" ? stat : stat.location,
            ctx: (0, context_1.getContext)(),
            startTime: Date.now(),
        };
        handler(req, res, (0, AppState_1.default)())
            .then((_r) => _r || (0, EmptyResponse_1.default)())
            .catch((_r) => (_r.responder ? _r : (0, UnhandledReponse_1.default)(_r)))
            .then((_r) => _r.json(log, req, res).http());
    };
};
exports.RouteHandler = RouteHandler;
const middlewaresHandler = async (handler, stat, args) => {
    return (req, res, next) => {
        logger_1.default.byType("debug", "start middleware processing url: ", req.url, ", name: ", stat.path);
        //TODO: use locals:_lifetime for context & stat & startTime
        const log = {
            path: stat.location,
            opts: (0, context_1.getContext)().opts,
            startTime: Date.now(),
        };
        handler((0, AppState_1.default)(), req, res, args, (0, after_hook_1.default)(res))
            .then((_r) => {
            logger_1.default.byType("debug", "end middleware processing, ", "failed: ", !!_r, ", url: ", req.url, "name: ", stat.path);
            if (_r)
                return _r.json(log, req, res).http();
            next();
        })
            .catch((_r) => {
            logger_1.default.byType("debug", "end middleware processing url:", req.url, ", name: ", stat.path, ", error:", _r);
            const $rs = _r.responder ? _r : (0, UnhandledReponse_1.default)(_r);
            $rs.json(log, req, res).http();
        });
    };
};
const addIHttpRoute = async (router, stat, ihttp) => {
    if (!ihttp)
        return false;
    if (!ihttp.__ihandler)
        throw `[KernelJs] ~ ${stat.fullPath} http route doesn't return async IHttp handler.`;
    const [config, handler, middlewares = []] = ihttp(stat);
    const attachs = [];
    const attached = [];
    for (const middleware of middlewares) {
        const name = typeof middleware == "string" ? middleware : middleware === null || middleware === void 0 ? void 0 : middleware.name;
        const md = (0, context_1.getContext)().net.middlewares.find((m) => m.name == name);
        if (md == null) {
            throw `[KernelJs] ~ Unknown middleware [${name}] ~ ${stat.location}`;
        }
        const args = typeof middleware == "string" ? {} : middleware;
        const _fn = await middlewaresHandler(md.action, stat, args);
        attached.push(name);
        attachs.push(_fn);
    }
    const endpoint = (0, exports.cleanRoutePath)(stat.file);
    logger_1.default.byType("http", `IHttp: ${stat.location}`, stat.path, `[${attached.join(",")}]`);
    const m = config.method;
    router[m](`/${endpoint}`, prepareHttpReq(attachs), attachs, handler);
};
exports.addIHttpRoute = addIHttpRoute;
const prepareHttpReq = (attachs) => {
    return (_req, _res, next) => {
        logger_1.default.byType("debug", "prepare req: ", _req.url, ", attachs: ", attachs);
        const req = _req;
        const res = _res;
        req.utils = (0, http_1.default)(req, res);
        req.__type = "ihttp";
        req.locals = {};
        res.__locals = {
            hooks: [],
            startTime: Date.now(),
        };
        return next();
    };
};
const cleanRoutePath = (file) => {
    if (file == "index.js")
        return "";
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
exports.cleanRoutePath = cleanRoutePath;
