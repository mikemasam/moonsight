"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
const AsyncFn = (() => __awaiter(void 0, void 0, void 0, function* () { return null; })).constructor;
const notFoundRouter = () => __awaiter(void 0, void 0, void 0, function* () {
    const handler = yield (0, exports.RouteHandler)(() => __awaiter(void 0, void 0, void 0, function* () { return (0, NotFound_1.default)(); }), "/");
    return [prepareHttpReq(), handler];
});
exports.notFoundRouter = notFoundRouter;
const RouteHandler = (handler, stat) => __awaiter(void 0, void 0, void 0, function* () {
    return (req, res) => {
        const log = {
            path: typeof stat == "string" ? stat : stat.location,
            opts: (0, context_1.getContext)().opts,
            startTime: Date.now(),
        };
        handler(req, res, (0, AppState_1.default)())
            .then((_r) => _r || (0, EmptyResponse_1.default)())
            .catch((_r) => (0, UnhandledReponse_1.default)(_r))
            .then((_r) => _r.json(log, req, res).http());
    };
});
exports.RouteHandler = RouteHandler;
const middlewaresHandler = (handler, stat, args) => __awaiter(void 0, void 0, void 0, function* () {
    return (req, res, next) => {
        //TODO: use locals:_lifetime for context & stat & startTime
        const log = {
            path: stat.location,
            opts: (0, context_1.getContext)().opts,
            startTime: Date.now(),
        };
        handler((0, AppState_1.default)(), req, res, args, addHook(res))
            .then((_r) => (_r ? _r.json(log, req, res) : next()))
            .catch((err) => (0, UnhandledReponse_1.default)(err).json(log, req, res));
    };
});
const addIHttpRoute = (router, stat, ihttp) => __awaiter(void 0, void 0, void 0, function* () {
    if (!ihttp)
        return false;
    if (!ihttp.__ihandler)
        throw `[KernelJs] ~ ${stat.fullPath} http route doesn't return async IHttp handler.`;
    const [handler, middlewares = []] = ihttp(stat);
    const attachs = [];
    const attached = [];
    for (const middleware of middlewares) {
        const name = typeof middleware == "string" ? middleware : middleware === null || middleware === void 0 ? void 0 : middleware.name;
        const md = (0, context_1.getContext)().net.middlewares.find((m) => m.name == name);
        if (md == null)
            continue;
        if ((md === null || md === void 0 ? void 0 : md.action) instanceof AsyncFn === false)
            throw `[KernelJs] ~ Unknown middleware [${name}] ~ ${stat.location}`;
        const args = typeof middleware == "string" ? {} : middleware;
        const _fn = yield middlewaresHandler(md.action, stat, args);
        attached.push(name);
        attachs.push(_fn);
    }
    const endpoint = (0, exports.cleanRoutePath)(stat.file);
    logger_1.default.byType("http", `[KernelJs] ~ IHttp: ${stat.location}`, stat.path, `[${attached.join(",")}]`);
    router.all(`/${endpoint}`, prepareHttpReq(), attachs, handler);
});
exports.addIHttpRoute = addIHttpRoute;
const prepareHttpReq = () => {
    return (_req, _res, next) => {
        const req = _req;
        const res = _res;
        req.__type = "ihttp";
        res.__locals = {
            hooks: [],
            startTime: Date.now(),
        };
        return next();
    };
};
const addHook = (res) => {
    return (hook) => {
        res.__locals.hooks.push(hook);
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
