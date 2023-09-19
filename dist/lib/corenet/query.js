"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("../context");
const NotFound_1 = __importDefault(require("../../responders/NotFound"));
const utils_1 = require("../socket/utils");
const logger_1 = __importDefault(require("../logger"));
const reservedEvents = [
    ":api:kernel:connection", //for newly connected remote corenet clients
];
class CoreNetQuery {
    constructor(selector, channel) {
        this.selector = selector;
        this.channel = channel;
    }
    async selectQuery(dpath, body) {
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
    }
    async query(event, body) {
        if (this.selector.ready === null) {
            logger_1.default.byType("corenet", "corenet not ready, action added to queue");
            return new Promise((resolv) => {
                this.selector.queue.push(() => resolv(this._query(event, body)));
            });
        }
        return this._query(event, body);
    }
    async _query(event, body) {
        if (event && reservedEvents.includes(event))
            throw new Error(`[KernelJs] ~ CoreNet query for reserved events ${event}`);
        if (this.selector.isLocal) {
            logger_1.default.byType("corenet", "using local corenet");
            return this.__localQuery(event, body);
        }
        else {
            logger_1.default.byType("corenet", "using remote corenet");
            return this.__remoteQuery(event, body);
        }
    }
    async __remoteQuery(event, body) {
        return new Promise(async (resolve, reject) => {
            if (!event || !this.selector.ready || !this.channel) {
                return this.__handleFailed(this.selector.socket, event, body, resolve, 502);
            }
            else {
                const data = { channel: this.channel, event, body };
                this.selector.socket.emit(this.channel == "core" ? event : "kernel.corenet.channel.transport", data, (response) => {
                    resolve(response);
                });
            }
        });
    }
    async __localQuery(event, body) {
        return new Promise(async (resolve, reject) => {
            if (!event || !this.selector.ready || !this.channel) {
                logger_1.default.byType("corenet", "invalid query params");
                return this.__handleFailed(null, event, body, resolve, 502);
            }
            const { coreIO } = (0, context_1.getContext)().net;
            const sockets = await coreIO.fetchSockets();
            //const data = { channel: this.channel, event, body };
            let consumer = sockets.find((s) => s.handshake.query.channelName == this.channel);
            if (!consumer) {
                return this.__handleFailed(null, event, body, resolve, 503);
            }
            else {
                logger_1.default.byType("corenet", "event send: ", event, ", to channel: ", this.channel);
                return consumer.emit(event, body, (args) => {
                    logger_1.default.byType("corenet", "event ack: ", event, ", from channel: ", this.channel);
                    return resolve(args);
                });
            }
        });
    }
    async __handleFailed(socket, event, body, fn, status = 404) {
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
        })
            .json(log, req, res)
            .socket();
    }
}
exports.default = CoreNetQuery;
