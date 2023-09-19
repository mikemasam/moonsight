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
exports.bootHttpApp = exports.createCoreServer = exports.createHttpServer = exports.createHttpApp = void 0;
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const logger_1 = __importDefault(require("./logger"));
function createHttpApp() {
    return (0, express_1.default)();
}
exports.createHttpApp = createHttpApp;
function createHttpServer(httpApp) {
    return new http_1.default.Server(httpApp);
}
exports.createHttpServer = createHttpServer;
function createCoreServer(opts) {
    return http_1.default.createServer();
}
exports.createCoreServer = createCoreServer;
function bootHttpApp() {
    return __awaiter(this, void 0, void 0, function* () {
        const ctx = global.deba_kernel_ctx;
        ctx.net.httpApp.use(express_1.default.json());
        ctx.net.httpApp.use((0, cors_1.default)());
        ctx.cleanup.add("HttpServer", () => {
            var _a, _b;
            (_a = ctx.net.httpServer) === null || _a === void 0 ? void 0 : _a.unref();
            (_b = ctx.net.httpServer) === null || _b === void 0 ? void 0 : _b.close();
        });
        ctx.cleanup.add("CoreServer", () => {
            var _a, _b;
            (_a = ctx.net.coreServer) === null || _a === void 0 ? void 0 : _a.unref();
            (_b = ctx.net.coreServer) === null || _b === void 0 ? void 0 : _b.close();
        });
        ctx.net.startup = () => {
            if (ctx.net.coreServer && ctx.opts.mountCore.mount) {
                ctx.net.coreServer.listen(ctx.opts.mountCore.port, "0.0.0.0", () => {
                    logger_1.default.kernel(`CoreNet: host:${ctx.opts.mountCore.port}`);
                });
            }
            if (ctx.net.httpServer) {
                ctx.net.httpServer.listen(ctx.opts.port, "0.0.0.0", () => {
                    logger_1.default.kernel(`Http&SocketIO: host:${ctx.opts.port}`);
                    ctx.events.emit("kernel.internal.http.ready");
                });
            }
        };
        return ctx;
    });
}
exports.bootHttpApp = bootHttpApp;
