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
const query_1 = __importDefault(require("./query"));
const socket_io_client_1 = require("socket.io-client");
const logger_1 = __importDefault(require("../logger"));
const context_1 = require("../context");
const NotFound_1 = __importDefault(require("../../responders/NotFound"));
const utils_1 = require("../socket/utils");
class CoreNetSelector {
    constructor() {
        this.socket = undefined;
        this.ready = null;
        this.isLocal = false;
        this.queue = [];
    }
    connectRemote() {
        this.ready = false;
        const { events, opts } = (0, context_1.getContext)();
        (0, context_1.getContext)().cleanup.add("Remote Core", () => {
            var _a;
            (_a = this.socket) === null || _a === void 0 ? void 0 : _a.disconnect();
        });
        events.once("kernel.ready", () => {
            logger_1.default.kernel(`CoreNet: connecting to ${opts.coreHost}...`);
            this.socket = (0, socket_io_client_1.io)(opts.coreHost, {
                transports: ["websocket"],
                query: {
                    channelName: opts.channelName,
                },
            });
            events.emit("kernel.corenet.connection", this.socket);
            this.socket.on("connect", () => this._connected());
            this.socket.on("disconnect", (reason) => this._disconnected(reason));
            this.socket.onAny((...args) => this._handleAll(...args));
        });
        return this;
    }
    connectLocal() {
        this.ready = false;
        const { opts } = (0, context_1.getContext)();
        (0, context_1.getContext)().events.once("kernel.ready", () => {
            logger_1.default.kernel(`CoreNet: local channel = (${opts.channelName})`);
            this.isLocal = true;
            this.ready = true;
            this.clearQueue();
            (0, context_1.getContext)().events.emit("kernel.internal.corenet.ready", {});
        });
        return this;
    }
    _handleAll(...args) {
        var _a;
        const [event, body, fn] = args;
        if ((_a = this.socket) === null || _a === void 0 ? void 0 : _a.hasListeners(event)) {
            //console.log("event found");
        }
        else {
            logger_1.default.byType("error", "CoreNet: event not found", event);
            const log = {
                path: "corenet.channel.receiver",
                ctx: (0, context_1.getContext)(),
                startTime: Date.now(),
            };
            const _socket = (0, utils_1.moveSocketToRequestRaw)(this.socket);
            const ip = (0, context_1.getContext)().opts.coreHost;
            const req = (0, utils_1.makeSocketRequest)(_socket, event, "icore", "icore", body);
            const res = (0, utils_1.makeSocketResponse)(fn);
            (0, NotFound_1.default)().json(log, req, res);
        }
    }
    _disconnected(reason) {
        this.ready = false;
        logger_1.default.kernel(`CoreNet: disconnected from ${(0, context_1.getContext)().opts.coreHost} - ${reason}`);
    }
    _connected() {
        this.ready = true;
        logger_1.default.kernel(`CoreNet: connected to ${(0, context_1.getContext)().opts.coreHost}`);
        this.clearQueue();
        (0, context_1.getContext)().events.emit("kernel.internal.corenet.ready", { ready: true });
    }
    clearQueue() {
        let task = this.queue.pop();
        while (task) {
            task();
            task = this.queue.pop();
        }
    }
    isConnected() {
        var _a;
        return (_a = this.socket) === null || _a === void 0 ? void 0 : _a.connected;
    }
    select(channel = "core") {
        return new query_1.default(this, channel);
    }
    query(dpath, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return new query_1.default(this, "").dpathQuery(dpath, body);
        });
    }
}
exports.default = CoreNetSelector;
