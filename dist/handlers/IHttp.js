"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IHttpDelete = exports.IHttpPut = exports.IHttpGet = exports.IHttpPost = void 0;
const universal_identity_1 = __importDefault(require("../lib/universal.identity"));
const context_1 = require("../lib/context");
const FailedResponse_1 = __importDefault(require("../responders/FailedResponse"));
const AppState_1 = __importDefault(require("../lib/AppState"));
const EmptyResponse_1 = __importDefault(require("../responders/EmptyResponse"));
const UnhandledReponse_1 = __importDefault(require("../responders/UnhandledReponse"));
const logger_1 = __importDefault(require("../lib/logger"));
const AsyncFn = (async () => null).constructor;
function IHttpBasic(handler, middlewares, config, method) {
    if (config == undefined)
        config = { method: "all" };
    if (method != undefined)
        config.method = method;
    function iHttpHandler(stat) {
        if (handler instanceof AsyncFn !== true)
            throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
        return [
            config,
            (req, res) => {
                var _a;
                const { startTime } = res.__locals;
                const log = {
                    path: stat.location,
                    ctx: (0, context_1.getContext)(),
                    startTime,
                };
                if (!(0, context_1.getContext)().ready)
                    return (0, FailedResponse_1.default)().json(log, req, res).http();
                if (config === null || config === void 0 ? void 0 : config.minVersion) {
                    if (!universal_identity_1.default.latestVersion((_a = req.query) === null || _a === void 0 ? void 0 : _a["v"], config.minVersion || false))
                        return (0, FailedResponse_1.default)({
                            status: 405,
                            message: "Please update to latest version to continue",
                        })
                            .json(log, req, res)
                            .http();
                }
                (0, context_1.getContext)().state.count++;
                logger_1.default.byType("debug", "start processing ", req.path);
                handler(req, res, (0, AppState_1.default)())
                    .then((_r) => (_r ? _r : (0, EmptyResponse_1.default)()))
                    .catch((_r) => (_r.responder ? _r : (0, UnhandledReponse_1.default)(_r)))
                    .then((_r) => {
                    (0, context_1.getContext)().state.count--;
                    logger_1.default.byType("debug", "end processing ", req.path);
                    return _r.json(log, req, res).http();
                });
            },
            middlewares,
        ];
    }
    iHttpHandler.__ihandler = "ihttp";
    return iHttpHandler;
}
const IHttpPost = (handler, middlewares, config) => {
    return IHttpBasic(handler, middlewares, config, "post");
};
exports.IHttpPost = IHttpPost;
const IHttpGet = (handler, middlewares, config) => IHttpBasic(handler, middlewares, config, "get");
exports.IHttpGet = IHttpGet;
const IHttpDelete = (handler, middlewares, config) => IHttpBasic(handler, middlewares, config, "delete");
exports.IHttpDelete = IHttpDelete;
const IHttpPut = (handler, middlewares, config) => IHttpBasic(handler, middlewares, config, "put");
exports.IHttpPut = IHttpPut;
const IHttp = (handler, middlewares, config) => IHttpBasic(handler, middlewares, config, "all");
exports.default = IHttp;
