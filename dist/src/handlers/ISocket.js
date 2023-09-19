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
const universal_identity_1 = __importDefault(require("../lib/universal.identity"));
const context_1 = require("../lib/context");
const FailedResponse_1 = __importDefault(require("../responders/FailedResponse"));
const AppState_1 = __importDefault(require("../lib/AppState"));
const EmptyResponse_1 = __importDefault(require("../responders/EmptyResponse"));
const UnhandledReponse_1 = __importDefault(require("../responders/UnhandledReponse"));
function ISocket(handler, middlewares, config) {
    function ISocketHandler(stat) {
        const AsyncFn = (() => __awaiter(this, void 0, void 0, function* () { return null; })).constructor;
        if (handler instanceof AsyncFn !== true)
            throw `[KernelJs] ~ ${stat.fullPath} ISocket async handler function is required.`;
        return [
            (req, res) => {
                const log = {
                    path: stat.location,
                    opts: (0, context_1.getContext)().opts,
                    startTime: Date.now(),
                };
                if (!(0, context_1.getContext)().ready)
                    return (0, FailedResponse_1.default)().json(log, req, res);
                if (config &&
                    !universal_identity_1.default.latestVersion(req.query.version, config.minVersion || false))
                    return (0, FailedResponse_1.default)({
                        status: 405,
                        data: { status: 405 },
                        message: "Please update to latest version to continue",
                    }).json(log, req, res);
                (0, context_1.getContext)().state.count++;
                handler(req, res, (0, AppState_1.default)())
                    .then((_r) => (_r ? _r : (0, EmptyResponse_1.default)()))
                    .catch((_r) => (0, UnhandledReponse_1.default)(_r))
                    .then((_r) => {
                    (0, context_1.getContext)().state.count--;
                    return _r.json(log, req, res).socket();
                });
            },
            middlewares,
        ];
    }
    ISocketHandler.__ihandler = "isocket";
    return ISocketHandler;
}
exports.default = ISocket;
