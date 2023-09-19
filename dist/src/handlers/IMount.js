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
const context_1 = require("../lib/context");
const AppState_1 = __importDefault(require("../lib/AppState"));
const AsyncFn = (() => __awaiter(void 0, void 0, void 0, function* () { return null; })).constructor;
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
