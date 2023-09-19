"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContext = void 0;
const app_cleanup_1 = __importDefault(require("./app.cleanup"));
const queue_1 = __importDefault(require("./queue"));
const redis_1 = require("redis");
const app_version_1 = __importDefault(require("./app.version"));
const http_1 = require("./http");
const socket_1 = require("./socket");
const events_1 = __importDefault(require("./events"));
const logger_1 = __importDefault(require("./logger"));
const getContext = () => {
    return global.deba_kernel_ctx;
};
exports.getContext = getContext;
function parseEnvLoggingOpts() {
    const logOpts = {};
    const logEnv = process.env.APP_LOGGING || undefined;
    if (logEnv == undefined)
        return logOpts;
    logger_1.default.kernel("logging env loaded");
    const parts = logEnv.split(",");
    for (let part of parts)
        logOpts[part] = true;
    return logOpts;
}
async function createContext(opts) {
    var _a, _b;
    opts.version = await (0, app_version_1.default)(opts);
    if (opts.coreHost && ((_a = opts.mountCore) === null || _a === void 0 ? void 0 : _a.mount))
        throw "[KernelJs] ~ Kernel failed to start, [coreMount and coreHost] only one is required.";
    if (!opts.channelName)
        throw "[KernelJs] ~ Kernel failed to start, channelName is required.";
    if (!opts.redis)
        throw "[KernelJs] ~ Kernel failed to start, redis config is required.";
    if (!opts.port)
        throw "[KernelJs] ~ Kernel failed to start, port is required.";
    if (!opts.settings)
        opts.settings = {};
    if (!opts.nodeIdentity || opts.nodeIdentity.length != 3)
        throw "[KernelJs] ~ Kernel failed to start, nodeIdentity is required [0-9]{3}.";
    if (!opts.host)
        opts.host = "localhost";
    opts.host = `${opts.host}:${opts.port}`;
    let mountCore = undefined;
    if (opts.mountCore) {
        mountCore = {
            port: opts.mountCore.port,
            mount: opts.mountCore.mount,
            allowedIPs: opts.mountCore.allowedIPs,
        };
    }
    const basePath = opts.apiMount && ((_b = opts.apiMount) === null || _b === void 0 ? void 0 : _b.length) ? `/${opts.apiMount}` : "";
    const envLoggingOpts = parseEnvLoggingOpts();
    const appOpts = {
        channelName: opts.channelName,
        version: opts.version,
        maxListeners: 20,
        host: opts.host,
        apiBasePath: basePath,
        apiPath: opts.apiPath,
        coreHost: opts.coreHost,
        apiMount: opts.apiMount,
        nodeIdentity: opts.nodeIdentity,
        apiMiddlewares: opts.apiMiddlewares,
        redis: { url: opts.redis.url },
        port: opts.port,
        shutdownTimeout: opts.shutdownTimeout || 30,
        mountCore,
        settings: {},
        logging: Object.assign(Object.assign({}, opts.logging), envLoggingOpts),
    };
    const httpApp = (0, http_1.createHttpApp)();
    const coreServer = (0, http_1.createCoreServer)(appOpts);
    const httpServer = (0, http_1.createHttpServer)(httpApp);
    const socketIO = await (0, socket_1.createSocketIOServer)(httpServer, appOpts, events_1.default);
    const coreIO = await (0, socket_1.createCoreIOServer)(coreServer, appOpts, events_1.default);
    let context = {
        autoBoot: opts.autoBoot,
        mocking: opts.mocking,
        events: events_1.default,
        queue: new queue_1.default(),
        opts: appOpts,
        net: {
            httpApp: httpApp,
            httpServer: httpServer,
            middlewares: [],
            RedisClient: (0, redis_1.createClient)({ url: opts.redis.url }),
            socketIO: socketIO,
            coreServer: coreServer,
            coreIO: coreIO,
            startup: () => null,
        },
        ready: undefined,
        state: {
            up: false,
            count: 0,
            shutdown: false,
            timeout: 0,
            corenetReady: false,
            redisReady: false,
            httpReady: false,
        },
        cleanup: (0, app_cleanup_1.default)(),
        boot: async () => false,
    };
    return context;
}
exports.default = createContext;
