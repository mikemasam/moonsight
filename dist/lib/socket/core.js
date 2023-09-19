"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../logger"));
const NotFound_1 = __importDefault(require("../../responders/NotFound"));
const utils_1 = require("./utils");
function useAuth(socket, next) {
    const ctx = global.deba_kernel_ctx;
    const allowedIPs = ctx.opts.mountCore.allowedIPs;
    const allowed = allowedIPs
        .split(",")
        .join("")
        .split(" ")
        .indexOf(socket.handshake.address) > -1;
    if (allowed) {
        logger_1.default.byTypes(["core", "info", "kernel", "networking"], `CoreNet: added [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
        next();
    }
    else {
        logger_1.default.byTypes(["core", "info", "kernel", "networking"], `CoreNet: rejected [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
        next(new Error("invalid"));
    }
}
function useCorenetChannelTransport(socket) {
    return (data, fn) => {
        const { channel, body, event } = data;
        const ctx = global.deba_kernel_ctx;
        if (ctx.net.coreIO == null) {
            logger_1.default.byTypes(["kernel", "error", "networking", "exception"], "ChannelTransport - Corenet not intialized");
            return;
        }
        ctx.net.coreIO.fetchSockets().then((sockets) => {
            let consumer = sockets.find((s) => s.handshake.query.channelName == channel);
            if (!consumer) {
                const log = {
                    path: "corenet.channel.transport",
                    ctx,
                    startTime: Date.now(),
                };
                const req = (0, utils_1.makeSocketRequest)(socket, event, "icore", "icore", body);
                const res = (0, utils_1.makeSocketResponse)(fn);
                logger_1.default.byTypes(["error", "networking", "corenet"], "passthrough event failed, channel offline, event:", event, ", channel:", channel);
                (0, NotFound_1.default)({
                    status: 503,
                    message: "Service not available at the moment, please try again later.",
                })
                    .json(log, req, res)
                    .socket();
            }
            else {
                logger_1.default.byTypes(["error", "networking", "corenet"], "passthrough event:", event, ", channel:", channel);
                consumer.emit(event, body, fn);
            }
        });
    };
}
function useAnyEvent(socket) {
    return (event, ...args) => {
        const ctx = global.deba_kernel_ctx;
        const count = socket.listenerCount(event);
        if (count < 1) {
            logger_1.default.byTypes(["error", "networking", "corenet"], "local corenet event not found: unhandled, event:", event);
            const log = {
                path: "corenet.channel.transport",
                ctx,
                startTime: Date.now(),
            };
            const [body, fn] = args;
            const req = (0, utils_1.makeSocketRequest)(socket, event, "icore", "icore", body);
            const res = (0, utils_1.makeSocketResponse)(fn);
            (0, NotFound_1.default)().json(log, req, res).socket();
        }
        else {
            logger_1.default.byTypes(["corenet", "networking"], "local corenet event handled,  event:", event);
        }
    };
}
async function CoreSocket(io, events, opts) {
    io.setMaxListeners(opts.maxListeners || 20);
    const coreApi = io.of("/");
    events.on("kernel.ready", () => {
        var _a;
        logger_1.default.byTypes(["core", "kernel", "networking"], `CoreNet: accepting [IP's Allowed ${(_a = opts.mountCore) === null || _a === void 0 ? void 0 : _a.allowedIPs}].`);
        coreApi.use(useAuth);
        coreApi.on("connection", (socket) => {
            broadcastCoreState(events, coreApi, "connection", socket);
            socket.on("disconnect", () => {
                broadcastCoreState(events, coreApi, "disconnect", socket);
            });
            socket.on("kernel.corenet.channel.transport", useCorenetChannelTransport((0, utils_1.moveSocketToRequestRaw)(socket)));
            socket.onAny(useAnyEvent((0, utils_1.moveSocketToRequestRaw)(socket)));
        });
    });
    return coreApi;
}
exports.default = CoreSocket;
const broadcastCoreState = async (events, coreApi, state, socket) => {
    const channel = {
        name: socket.handshake.query.channelName,
        ip: socket.handshake.address,
        id: socket.id,
    };
    const sockets = await coreApi.fetchSockets();
    let channels = sockets.map((s) => ({
        name: s.handshake.query.channelName,
        ip: s.handshake.address,
        id: s.id,
    }));
    //notify remote cores for new connections
    coreApi.emit(":api:kernel:connection", { channels, channel, state });
    //notify local core for new connections
    events.emit("kernel.connection", { channels, channel, state });
};
