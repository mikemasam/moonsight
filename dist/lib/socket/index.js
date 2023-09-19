"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSocketIOServer = exports.createCoreIOServer = void 0;
const socket_io_1 = require("socket.io");
const core_1 = __importDefault(require("./core"));
const client_1 = __importDefault(require("./client"));
async function createCoreIOServer(coreServer, opts, events) {
    var _a;
    if ((_a = opts.mountCore) === null || _a === void 0 ? void 0 : _a.mount) {
        const coreIO = new socket_io_1.Server(coreServer, {
            cors: { origin: "*" },
            transports: ["websocket"],
            allowEIO3: true,
        });
        return (0, core_1.default)(coreIO, events, opts);
    }
    return null;
}
exports.createCoreIOServer = createCoreIOServer;
async function createSocketIOServer(httpServer, opts, events) {
    const io = new socket_io_1.Server(httpServer, {
        cors: { origin: "*" },
        transports: ["websocket"],
        allowEIO3: true,
    });
    return (0, client_1.default)(io, events, opts);
}
exports.createSocketIOServer = createSocketIOServer;
