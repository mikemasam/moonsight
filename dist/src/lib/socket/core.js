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
        logger_1.default.byType("core", `CoreNet: added [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
        next();
    }
    else {
        logger_1.default.byType("core", `CoreNet: rejected [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
        next(new Error("invalid"));
    }
}
function useCorenetChannelTransport(socket) {
    return (data, fn) => {
        const { channel, body, event } = data;
        const ctx = global.deba_kernel_ctx;
        if (ctx.net.coreIO == null) {
            logger_1.default.kernel("ChannelTransport - Corenet not intialized");
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
                (0, NotFound_1.default)({
                    status: 503,
                    message: "Service not available at the moment, please try again later.",
                }).json(log, req, res);
            }
            else {
                consumer.emit(event, body, fn);
            }
        });
    };
}
function useAnyEvent(socket) {
    return (event, ...args) => {
        const ctx = global.deba_kernel_ctx;
        if (socket.listenerCount(event) < 1) {
            const log = {
                path: "corenet.channel.transport",
                ctx,
                startTime: Date.now(),
            };
            const [body, fn] = args;
            const req = (0, utils_1.makeSocketRequest)(socket, event, "icore", "icore", body);
            const res = (0, utils_1.makeSocketResponse)(fn);
            (0, NotFound_1.default)().json(log, req, res);
        }
    };
}
function CoreSocket(io, events, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        io.setMaxListeners(opts.maxListeners || 20);
        const coreApi = io.of("/");
        events.on("kernel.ready", () => {
            logger_1.default.byType("core", `CoreNet: accepting [IP's Allowed ${opts.mountCore.allowedIPs}].`);
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
    });
}
exports.default = CoreSocket;
const broadcastCoreState = (events, coreApi, state, socket) => __awaiter(void 0, void 0, void 0, function* () {
    const channel = {
        name: socket.handshake.query.channelName,
        ip: socket.handshake.address,
        id: socket.id,
    };
    const sockets = yield coreApi.fetchSockets();
    let channels = sockets.map((s) => ({
        name: s.handshake.query.channelName,
        ip: s.handshake.address,
        id: s.id,
    }));
    //notify remote cores for new connections
    coreApi.emit(":api:kernel:connection", { channels, channel, state });
    //notify local core for new connections
    events.emit("kernel.connection", { channels, channel, state });
});
