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
const UnhandledReponse_1 = __importDefault(require("../responders/UnhandledReponse"));
const AsyncFn = (() => __awaiter(void 0, void 0, void 0, function* () { return null; })).constructor;
function ISocketMount(handler, _, config) {
    function ISocketMountHandler(stat) {
        if (handler instanceof AsyncFn !== true)
            throw `[KernelJs] ~ ${stat.fullPath} ISocketMount async handler function is required.`;
        return (req, res, next) => __awaiter(this, void 0, void 0, function* () {
            const log = {
                path: stat.location,
                ctx: (0, context_1.getContext)(),
                startTime: Date.now(),
            };
            if (!(0, context_1.getContext)().ready)
                return (0, FailedResponse_1.default)().json(log, req, res);
            if (config) {
                if (!universal_identity_1.default.latestVersion(req.query.version, config.minVersion || false))
                    return (0, FailedResponse_1.default)({
                        status: 405,
                        data: { status: 405 },
                        message: "Please update to latest version to continue",
                    }).json(log, req, res);
            }
            (0, context_1.getContext)().state.count++;
            return handler(req, (0, AppState_1.default)())
                .catch((_r) => (0, UnhandledReponse_1.default)(_r))
                .then((_r) => {
                (0, context_1.getContext)().state.count--;
                return (_r === null || _r === void 0 ? void 0 : _r.responder) ? _r.json(log, req, res).socket() : next();
            });
        });
    }
    ISocketMountHandler.__ihandler = "isocketmount";
    return ISocketMountHandler;
}
exports.default = ISocketMount;
