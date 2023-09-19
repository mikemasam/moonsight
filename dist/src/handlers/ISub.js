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
const logger_1 = __importDefault(require("../lib/logger"));
const context_1 = require("../lib/context");
const AppState_1 = __importDefault(require("../lib/AppState"));
function listen(channels, handler) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, context_1.getContext)().net.RedisClientSubscriber.subscribe(channels, (message, channel) => {
            logger_1.default.byType("sub", `new message`, message);
            handler((0, AppState_1.default)(), channel, JSON.parse(message));
        });
    });
}
function ISub(handler, channels, opts) {
    function iSubHandler(stat, name) {
        if (!Array.isArray(channels))
            throw `ISub: [${stat.path}] channels should an a string array`;
        (0, context_1.getContext)().events.once("kernel.corenet.ready", () => listen(channels, handler));
    }
    iSubHandler.__ihandler = "isub";
    return iSubHandler;
}
exports.default = ISub;
