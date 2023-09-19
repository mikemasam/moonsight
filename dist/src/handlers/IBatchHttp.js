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
const Request_1 = require("../responders/Request");
const AppState_1 = __importDefault(require("../lib/AppState"));
const FailedResponse_1 = __importDefault(require("../responders/FailedResponse"));
const __1 = require("..");
const logger_1 = __importDefault(require("../lib/logger"));
const AsyncFn = (() => __awaiter(void 0, void 0, void 0, function* () { return null; })).constructor;
function IBatchHttp(routes, middlewares) {
    function IBatchHttpHandler(stat) {
        for (const key in routes) {
            const route = routes[key];
            if (key == "com")
                throw `[KernelJs] ~ ${stat.fullPath} 'com' route is not available.`;
            if (route instanceof AsyncFn !== true)
                throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
        }
        const err = (e) => {
            logger_1.default.handledExeception(e);
            return null;
        };
        return [
            (req, res) => {
                var _a;
                const { startTime } = res.__locals;
                const log = {
                    path: stat.location,
                    ctx: (0, context_1.getContext)(),
                    startTime,
                };
                if (!(0, context_1.getContext)().ready)
                    return (0, FailedResponse_1.default)().json(log, req, res);
                (0, context_1.getContext)().state.count++;
                const body = req.body;
                const state = new Request_1.RequestState(req);
                const results = {};
                const tasks = [];
                const com = body["com"];
                for (const key in body) {
                    if (key == "com")
                        continue;
                    const route = routes[key];
                    if (route) {
                        tasks.push((_a = route(Object.assign(Object.assign({}, com), body[key]), state, (0, AppState_1.default)())) === null || _a === void 0 ? void 0 : _a.catch(err).then((result) => {
                            results[key] = result;
                        }));
                    }
                    else {
                        results[key] = null;
                    }
                }
                Promise.all(tasks).then(() => (0, __1.Response)(results).json(log, req, res).http());
                (0, context_1.getContext)().state.count--;
            },
            middlewares,
        ];
    }
    IBatchHttpHandler.__ihandler = "ihttp";
    return IBatchHttpHandler;
}
exports.default = IBatchHttp;
