"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppState_1 = __importDefault(require("../lib/AppState"));
const context_1 = require("../lib/context");
const EmptyResponse_1 = __importDefault(require("../responders/EmptyResponse"));
const UnhandledReponse_1 = __importDefault(require("../responders/UnhandledReponse"));
const AsyncFn = (async () => null).constructor;
function ICore(handler, middlewares) {
    function ICoreHandler(stat) {
        if (handler instanceof AsyncFn !== true)
            throw `[KernelJs] ~ ${stat.fullPath} ICore async handler function is required.`;
        return [
            (req, res) => {
                const log = {
                    path: stat.location,
                    startTime: Date.now(),
                };
                //if (!getContext().ready) return FailedResponse()(log, req, res);
                (0, context_1.getContext)().state.count++;
                handler(req, res, (0, AppState_1.default)())
                    .then((_r) => _r || (0, EmptyResponse_1.default)())
                    .catch((_r) => {
                    return _r.responder ? _r : (0, UnhandledReponse_1.default)(_r);
                })
                    .then((_r) => {
                    (0, context_1.getContext)().state.count--;
                    return _r.json(log, req, res).socket();
                });
            },
            middlewares,
        ];
    }
    ICoreHandler.__ihandler = "icore";
    return ICoreHandler;
}
exports.default = ICore;
