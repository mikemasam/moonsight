"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../lib/context");
const AppState_1 = __importDefault(require("../lib/AppState"));
const AsyncFn = (async () => null).constructor;
function IMount(handler, opts) {
    function IMountHandler(stat) {
        if (handler instanceof AsyncFn !== true)
            throw `[KernelJs] ~ ${stat.fullPath} IMount async handler function is required.`;
        if ((opts === null || opts === void 0 ? void 0 : opts.length) && opts.indexOf("kernel.boot") > -1) {
            handler((0, AppState_1.default)(), {
                path: stat.path,
                router: stat.router,
            });
        }
        else if ((opts === null || opts === void 0 ? void 0 : opts.length) && opts.indexOf("kernel.ready") > -1) {
            (0, context_1.getContext)().events.once("kernel.ready", () => {
                handler((0, AppState_1.default)(), {
                    path: stat.path,
                    router: stat.router,
                });
            });
        }
        else {
            (0, context_1.getContext)().events.once("kernel.corenet.ready", () => {
                handler((0, AppState_1.default)(), {
                    path: stat.path,
                    router: stat.router,
                });
            });
        }
    }
    IMountHandler.__ihandler = "imount";
    return IMountHandler;
}
exports.default = IMount;
