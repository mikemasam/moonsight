"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addISocketMount = exports.addISocketRoute = void 0;
const context_1 = require("../context");
const logger_1 = __importDefault(require("../logger"));
const AppState_1 = __importDefault(require("../AppState"));
const UnhandledReponse_1 = __importDefault(require("../../responders/UnhandledReponse"));
const utils_1 = require("../socket/utils");
const after_hook_1 = __importDefault(require("./after-hook"));
const AsyncFn = (async () => null).constructor;
const middlewaresHandler = (handler, stat, args) => {
    return async (req, res, next) => {
        const log = {
            path: stat.location,
            opts: (0, context_1.getContext)().opts,
            startTime: Date.now(),
        };
        return handler((0, AppState_1.default)(), req, res, args, (0, after_hook_1.default)(res))
            .then((_r) => (_r ? _r.json(log, req, res).socket() : next(req, res)))
            .catch((_r) => (_r.responder ? _r : (0, UnhandledReponse_1.default)(_r)))
            .then((_r) => _r.json(log, req, res).socket());
    };
};
const addISocketRoute = async (stat, isocket) => {
    if (!isocket)
        return false;
    if (!isocket.__ihandler)
        throw `[KernelJs] ~ ${stat.fullPath} socket route doesn't return async ISocket handler.`;
    const [handler, middlewares] = isocket(stat);
    const attachs = [];
    const attached = [];
    for (const middleware of middlewares) {
        const name = typeof middleware == "string" ? middleware : middleware === null || middleware === void 0 ? void 0 : middleware.name;
        const md = (0, context_1.getContext)().net.middlewares.find((m) => m.name == name);
        if (md == null)
            continue;
        if ((md === null || md === void 0 ? void 0 : md.action) instanceof AsyncFn === false)
            throw `[KernelJs] ~ ISocket Unknown middleware [${name}] ~ ${stat.location}`;
        const args = typeof name == "string" ? {} : middleware;
        const _fn = middlewaresHandler(md.action, stat, args);
        attachs.push(_fn);
        attached.push(name);
    }
    const endpoint = await cleanRoutePath(stat.location);
    logger_1.default.kernel(`ISocket: ${stat.location}`, endpoint, `[${attached.join(",")}]`);
    queueEndpoint(endpoint, handler, attachs);
};
exports.addISocketRoute = addISocketRoute;
const queueEndpoint = async (endpoint, handler, middlewares) => {
    (0, context_1.getContext)().net.socketIO.on("connection", (_socket) => {
        const socket = (0, utils_1.moveSocketToRequestRaw)(_socket);
        socket.on(endpoint, (data, fn) => {
            const req = (0, utils_1.makeSocketRequest)(socket, endpoint, "isocket", "isocket", data);
            const res = (0, utils_1.makeSocketResponse)(fn);
            const mds = [...middlewares, handler];
            const run = (req, res) => mds.shift()(req, res, run);
            return run(req, res);
        });
    });
};
//socket io middleware
const addISocketMount = async (stat, isocketmount) => {
    const originalUrl = await cleanRoutePath(stat.location);
    const handler = isocketmount(stat);
    logger_1.default.byType("socketmount", `[KernelJs] ~ ISocketMount: ${stat.location}`);
    (0, context_1.getContext)().net.socketIO.use((_socket, next) => {
        const socket = (0, utils_1.moveSocketToRequestRaw)(_socket);
        const req = (0, utils_1.makeSocketRequest)(socket, originalUrl, "isocketmount", "isocketmount", null);
        const fn = (response) => {
            var _a;
            if (parseInt(String((_a = req.query) === null || _a === void 0 ? void 0 : _a.explain)) === 0) {
                //for buggy socket implemetation
                const err = new Error(`${response.message} --x`);
                next(err);
            }
            else {
                const err = new Error(response.message);
                err.data = response.data;
                //err.status = response.status;
                next(err);
            }
        };
        const res = (0, utils_1.makeSocketResponse)(fn);
        handler(req, res, next);
    });
};
exports.addISocketMount = addISocketMount;
//console.log(handler);
const cleanRoutePath = async (file) => {
    return file
        .replace("/index.js", "")
        .replace("/index.ts", "")
        .replace(".js", "")
        .replace(".ts", "")
        .split("/")
        .join(":");
};
