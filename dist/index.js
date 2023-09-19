"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.z = exports.UID = exports.UUID = exports.NoResponse = exports.RequestState = exports.Request = exports.TestRegex = exports.CoreNet = exports.IJob = exports.ISub = exports.IBatchHttp = exports.IMount = exports.ICore = exports.ISocketMount = exports.ISocket = exports.IHttpMiddleware = exports.IHttpPut = exports.IHttpDelete = exports.IHttpPost = exports.IHttpGet = exports.IHttp = exports.FailedResponse = exports.EmptyResponse = exports.BasicResponse = exports.Response = exports.NotFound = exports.UnhandledReponse = void 0;
const events_1 = require("./lib/events");
const index_1 = __importDefault(require("./lib/router/index"));
const universal_identity_1 = __importDefault(require("./lib/universal.identity"));
exports.UID = universal_identity_1.default;
const testregex_1 = __importDefault(require("./lib/testregex"));
exports.TestRegex = testregex_1.default;
const index_2 = __importStar(require("./lib/corenet/index"));
Object.defineProperty(exports, "CoreNet", { enumerable: true, get: function () { return index_2.CoreNet; } });
const context_1 = __importDefault(require("./lib/context"));
const http_1 = require("./lib/http");
const boot_redis_1 = __importDefault(require("./lib/boot.redis"));
const UnhandledReponse_1 = __importDefault(require("./responders/UnhandledReponse"));
exports.UnhandledReponse = UnhandledReponse_1.default;
const NotFound_1 = __importDefault(require("./responders/NotFound"));
exports.NotFound = NotFound_1.default;
const NoResponse_1 = __importDefault(require("./responders/NoResponse"));
exports.NoResponse = NoResponse_1.default;
const EmptyResponse_1 = __importDefault(require("./responders/EmptyResponse"));
exports.EmptyResponse = EmptyResponse_1.default;
const FailedResponse_1 = __importDefault(require("./responders/FailedResponse"));
exports.FailedResponse = FailedResponse_1.default;
const Request_1 = __importStar(require("./responders/Request"));
Object.defineProperty(exports, "RequestState", { enumerable: true, get: function () { return Request_1.RequestState; } });
const Response_1 = __importDefault(require("./responders/Response"));
exports.BasicResponse = Response_1.default;
const IHttp_1 = __importStar(require("./handlers/IHttp"));
exports.IHttp = IHttp_1.default;
Object.defineProperty(exports, "IHttpGet", { enumerable: true, get: function () { return IHttp_1.IHttpGet; } });
Object.defineProperty(exports, "IHttpPost", { enumerable: true, get: function () { return IHttp_1.IHttpPost; } });
Object.defineProperty(exports, "IHttpDelete", { enumerable: true, get: function () { return IHttp_1.IHttpDelete; } });
Object.defineProperty(exports, "IHttpPut", { enumerable: true, get: function () { return IHttp_1.IHttpPut; } });
const ISocket_1 = __importDefault(require("./handlers/ISocket"));
exports.ISocket = ISocket_1.default;
const ISocketMount_1 = __importDefault(require("./handlers/ISocketMount"));
exports.ISocketMount = ISocketMount_1.default;
const ICore_1 = __importDefault(require("./handlers/ICore"));
exports.ICore = ICore_1.default;
const IMount_1 = __importDefault(require("./handlers/IMount"));
exports.IMount = IMount_1.default;
const IBatchHttp_1 = __importDefault(require("./handlers/IBatchHttp"));
exports.IBatchHttp = IBatchHttp_1.default;
const ISub_1 = __importDefault(require("./handlers/ISub"));
exports.ISub = ISub_1.default;
const IJob_1 = __importDefault(require("./handlers/IJob"));
exports.IJob = IJob_1.default;
const IHttpMiddleware_1 = __importDefault(require("./handlers/IHttpMiddleware"));
exports.IHttpMiddleware = IHttpMiddleware_1.default;
const zod_1 = __importDefault(require("zod"));
exports.z = zod_1.default;
async function create$kernel(args, beforeHooks, afterHooks) {
    if (beforeHooks)
        await Promise.all(beforeHooks.map((c) => c()));
    global.deba_kernel_ctx = await (0, context_1.default)(args);
    await (0, events_1.SystemEvents)();
    await (0, index_1.default)();
    await (0, index_2.default)();
    await (0, http_1.bootHttpApp)();
    global.deba_kernel_ctx.queue.initQueue();
    if (afterHooks) {
        global.deba_kernel_ctx.events.on("kernel.ready", async () => {
            Promise.all(afterHooks.map((c) => c(global.deba_kernel_ctx)));
        });
    }
    if (!global.deba_kernel_ctx.opts.port) {
        throw new Error(`[KernelJs] ~ Invalid server port [port] = ${global.deba_kernel_ctx.opts.port}.`);
    }
    global.deba_kernel_ctx.boot = async () => {
        if (global.deba_kernel_ctx.state.up)
            return false;
        global.deba_kernel_ctx.state.up = true;
        return new Promise(async (reslv) => {
            global.deba_kernel_ctx.events.once("kernel.ready", () => reslv(true));
            await (0, boot_redis_1.default)();
            global.deba_kernel_ctx.net.startup();
        });
    };
    if (global.deba_kernel_ctx.autoBoot)
        await global.deba_kernel_ctx.boot();
    return global.deba_kernel_ctx;
}
exports.default = create$kernel;
const UUID = universal_identity_1.default;
exports.UUID = UUID;
const Request = Request_1.default;
exports.Request = Request;
const Response = Response_1.default;
exports.Response = Response;
