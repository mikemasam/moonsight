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
exports.addICoreRoute = void 0;
const context_1 = require("../context");
const logger_1 = __importDefault(require("../logger"));
const AppState_1 = __importDefault(require("../AppState"));
const UnhandledReponse_1 = __importDefault(require("../../responders/UnhandledReponse"));
const utils_1 = require("../socket/utils");
const AsyncFn = (() => __awaiter(void 0, void 0, void 0, function* () { return null; })).constructor;
const middlewaresHandler = (handler, stat, args) => __awaiter(void 0, void 0, void 0, function* () {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const log = {
            path: stat.location,
            ctx: (0, context_1.getContext)(),
            startTime: Date.now(),
        };
        return handler((0, AppState_1.default)(), req, res, args)
            .then((_r) => (_r ? _r.json(log, req, res).socket() : next(req, res)))
            .catch((err) => (0, UnhandledReponse_1.default)(err).json(log, req, res).socket());
    });
});
const addICoreRoute = (stat, icore) => __awaiter(void 0, void 0, void 0, function* () {
    if (!icore)
        return false;
    if (!icore.__ihandler)
        throw `[KernelJs] ~ ${stat.fullPath} core route doesn't return async ICore handler.`;
    const [handler, middlewares] = icore(stat);
    const attachs = [];
    for (const middleware of middlewares) {
        const name = typeof middleware == "string" ? middleware : middleware.name;
        const md = (0, context_1.getContext)().net.middlewares.find((m) => m.name == name);
        if (!md)
            continue;
        if ((md === null || md === void 0 ? void 0 : md.action) instanceof AsyncFn === false)
            throw `[KernelJs] ~ ICore Unknown middleware [${name}] ~ ${stat.location}`;
        const args = typeof name == "string" ? {} : middleware;
        const _fn = yield middlewaresHandler(md.action, stat, args);
        attachs.push(_fn);
    }
    const endpoint = yield cleanRoutePath(stat.location);
    logger_1.default.byType("core", `${stat.location}`, endpoint);
    if ((0, context_1.getContext)().opts.mountCore.mount) {
        handleLocalCoreNet(endpoint, handler, attachs);
    }
    else {
        handleRemoteCoreNet(endpoint, handler, attachs);
    }
});
exports.addICoreRoute = addICoreRoute;
const handleLocalCoreNet = (endpoint, handler, middlewares) => __awaiter(void 0, void 0, void 0, function* () {
    const originalUrl = endpoint;
    (0, context_1.getContext)().net.coreIO.on("connection", (_socket) => {
        _socket.on(endpoint, (data, fn) => {
            const { body } = data;
            const socket = (0, utils_1.moveSocketToRequestRaw)(_socket);
            const req = (0, utils_1.makeSocketRequest)(socket, originalUrl, "icore", "icore", body);
            const res = (0, utils_1.makeSocketResponse)(fn);
            const mds = [...middlewares, handler];
            const run = (req, res) => { var _a; return (_a = mds.shift()) === null || _a === void 0 ? void 0 : _a(req, res, run); };
            run(req, res);
        });
    });
});
const handleRemoteCoreNet = (endpoint, handler, middlewares) => __awaiter(void 0, void 0, void 0, function* () {
    const originalUrl = endpoint;
    (0, context_1.getContext)().events.on("kernel.corenet.connection", (_socket) => {
        //console.log("remote route added", socket.io.opts.hostname);
        _socket.on(endpoint, (body, fn) => {
            const socket = (0, utils_1.moveSocketToRequestRaw)(_socket);
            //const { body, channel } = data;
            const req = (0, utils_1.makeSocketRequest)(socket, originalUrl, "icore", "icore", body);
            const res = (0, utils_1.makeSocketResponse)(fn);
            const mds = [...middlewares, handler];
            const run = (req, res) => { var _a; return (_a = mds.shift()) === null || _a === void 0 ? void 0 : _a(req, res, run); };
            run(req, res);
        });
    });
});
const cleanRoutePath = (file) => __awaiter(void 0, void 0, void 0, function* () {
    return file
        .replace("/index.js", "")
        .replace("/index.ts", "")
        .replace(".ts", "")
        .replace(".js", "")
        .split("/")
        .join(":");
});
