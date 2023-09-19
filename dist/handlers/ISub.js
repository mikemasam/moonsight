"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../lib/logger"));
const context_1 = require("../lib/context");
const AppState_1 = __importDefault(require("../lib/AppState"));
//export type ISubHandlerRoute = {
//  (stat: RouteStat, name: string): void;
//  __ihandler: string;
//};
async function listen(channels, handler) {
    await (0, context_1.getContext)().net.RedisClientSubscriber.subscribe(channels, (message, channel) => {
        logger_1.default.byType("sub", `new message`, message);
        handler((0, AppState_1.default)(), channel, JSON.parse(message));
    });
}
function ISub(handler, channels, opts) {
    function iSubHandler(stat) {
        if (!Array.isArray(channels))
            throw `ISub: [${stat.path}] channels should an a string array`;
        (0, context_1.getContext)().events.once("kernel.corenet.ready", () => listen(channels, handler));
    }
    iSubHandler.__ihandler = "isub";
    return iSubHandler;
}
exports.default = ISub;
