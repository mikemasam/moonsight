"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../logger"));
async function ClientSocket(io, events, opts) {
    io.setMaxListeners(opts.maxListeners || 20);
    const clientIO = io.of("/");
    clientIO.use((socket, next) => {
        logger_1.default.byType("socket", `[KernelJs] ~ SocketIO: consumer added [${socket.handshake.address}].`);
        next();
    });
    return clientIO;
}
exports.default = ClientSocket;
