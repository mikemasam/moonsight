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
exports.createSocketIOServer = exports.createCoreIOServer = void 0;
const socket_io_1 = require("socket.io");
const core_1 = __importDefault(require("./core"));
const client_1 = __importDefault(require("./client"));
function createCoreIOServer(coreServer, opts, events) {
    return __awaiter(this, void 0, void 0, function* () {
        if (opts.mountCore.mount) {
            const coreIO = new socket_io_1.Server(coreServer, {
                cors: { origin: "*" },
                transports: ["websocket"],
                allowEIO3: true,
            });
            return (0, core_1.default)(coreIO, events, opts);
        }
        return null;
    });
}
exports.createCoreIOServer = createCoreIOServer;
function createSocketIOServer(httpServer, opts, events) {
    return __awaiter(this, void 0, void 0, function* () {
        const io = new socket_io_1.Server(httpServer, {
            cors: { origin: "*" },
            transports: ["websocket"],
            allowEIO3: true,
        });
        return (0, client_1.default)(io, events, opts);
    });
}
exports.createSocketIOServer = createSocketIOServer;
