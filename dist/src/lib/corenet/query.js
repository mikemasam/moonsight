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
const context_1 = require("../context");
const NotFound_1 = __importDefault(require("../../responders/NotFound"));
const utils_1 = require("../socket/utils");
const reservedEvents = [
    ":api:kernel:connection", //for newly connected remote corenet clients
];
class CoreNetQuery {
    constructor(selector, channel) {
        this.selector = selector;
        this.channel = channel;
    }
    dpathQuery(dpath, body) {
        return __awaiter(this, void 0, void 0, function* () {
            this.channel = "";
            if (!(dpath === null || dpath === void 0 ? void 0 : dpath.length))
                return this.query("", body);
            const matched = [
                ...dpath.matchAll(/(dapp:\/\/)([a-z\.]*)([:a-z\.\-\/\[\]]*)/g),
            ][0];
            if (matched.length < 3 || matched[1] != "dapp://")
                return this.query("", body);
            this.channel = matched[2];
            return this.query(matched[3], body);
        });
    }
    query(event, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.selector.ready === null) {
                return new Promise((resolv) => {
                    this.selector.queue.push(() => resolv(this._query(event, body)));
                });
            }
            return this._query(event, body);
        });
    }
    _query(event, body) {
        return __awaiter(this, void 0, void 0, function* () {
            if (event && reservedEvents.includes(event))
                throw new Error(`[KernelJs] ~ CoreNet query for reserved events ${event}`);
            if (this.selector.isLocal) {
                return this.__localQuery(event, body);
            }
            else {
                return this.__remoteQuery(event, body);
            }
        });
    }
    __remoteQuery(event, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!event || !this.selector.ready || !this.channel) {
                    return this.__handleFailed(this.selector.socket, event, body, resolve, 502);
                }
                else {
                    const data = { channel: this.channel, event, body };
                    this.selector.socket.emit(this.channel == "core" ? event : "kernel.corenet.channel.transport", data, (response) => {
                        resolve(response);
                    });
                }
            }));
        });
    }
    __localQuery(event, body) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((resolve, reject) => __awaiter(this, void 0, void 0, function* () {
                if (!event || !this.selector.ready || !this.channel)
                    return this.__handleFailed(null, event, body, resolve, 502);
                const { coreIO } = (0, context_1.getContext)().net;
                const sockets = yield coreIO.fetchSockets();
                //const data = { channel: this.channel, event, body };
                let consumer = sockets.find((s) => s.handshake.query.channelName == this.channel);
                if (!consumer) {
                    return this.__handleFailed(null, event, body, resolve, 503);
                }
                else {
                    return consumer.emit(event, body, resolve);
                }
            }));
        });
    }
    __handleFailed(socket, event, body, fn, status = 404) {
        return __awaiter(this, void 0, void 0, function* () {
            const log = {
                path: "kernel.corenet.channel.transport",
                ctx: (0, context_1.getContext)(),
                startTime: Date.now(),
            };
            const _socket = (0, utils_1.moveSocketToRequestRaw)(socket);
            const req = (0, utils_1.makeSocketRequest)(_socket, event, "icore", "icore", body, "");
            const res = (0, utils_1.makeSocketResponse)(fn);
            return (0, NotFound_1.default)({
                status,
                message: "Service not available at the moment, please try again later.",
            }).json(log, req, res);
        });
    }
}
exports.default = CoreNetQuery;
