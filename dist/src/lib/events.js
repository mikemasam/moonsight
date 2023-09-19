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
exports.SystemEvents = void 0;
const events_1 = __importDefault(require("events"));
const logger_1 = __importDefault(require("./logger"));
const context_1 = require("./context");
const events = new events_1.default();
exports.default = events;
function SystemEvents() {
    return __awaiter(this, void 0, void 0, function* () {
        (0, context_1.getContext)().events.setMaxListeners((0, context_1.getContext)().opts.maxListeners || 20);
        const heartbeat = setInterval(() => {
            (0, context_1.getContext)().events.emit("kernel.internal.heartbeat", {});
            if ((0, context_1.getContext)().ready)
                (0, context_1.getContext)().events.emit("kernel.heartbeat", {});
        }, 1000);
        (0, context_1.getContext)().events.on("kernel.ready", (fromW) => {
            (0, context_1.getContext)().state.timeout = (0, context_1.getContext)().opts.shutdownTimeout;
            if ((0, context_1.getContext)().ready === undefined)
                (0, context_1.getContext)().ready = true;
            //else isAliveCheck();
        });
        const testReady = () => {
            if (!(0, context_1.getContext)().state.redisReady)
                return;
            if (!(0, context_1.getContext)().state.httpReady)
                return;
            if ((0, context_1.getContext)().ready === undefined)
                (0, context_1.getContext)().events.emit("kernel.ready", "form test");
        };
        (0, context_1.getContext)().events.on("kernel.internal.redis.ready", () => {
            (0, context_1.getContext)().state.redisReady = true;
            (0, context_1.getContext)().events.emit("kernel.redis.ready");
            testReady();
        });
        (0, context_1.getContext)().events.on("kernel.internal.http.ready", () => {
            (0, context_1.getContext)().state.httpReady = true;
            (0, context_1.getContext)().events.emit("kernel.http.ready");
            testReady();
        });
        (0, context_1.getContext)().events.on("kernel.internal.corenet.ready", () => {
            (0, context_1.getContext)().state.corenetReady = true;
            (0, context_1.getContext)().events.emit("kernel.corenet.ready");
        });
        //TODO: enable state count
        const isAliveCheck = () => {
            //logger.byType("state", `State Count: ${getContext().state.count}`);
            if ((0, context_1.getContext)().state.shutdown &&
                ((0, context_1.getContext)().state.count <= 0 || (0, context_1.getContext)().state.timeout <= 0)) {
                logger_1.default.kernel("-_-");
                if (!process.env.JEST_WORKER_ID)
                    process.exit(0);
            }
            else if ((0, context_1.getContext)().state.shutdown) {
                (0, context_1.getContext)().state.timeout--;
            }
        };
        (0, context_1.getContext)().events.on("kernel.internal.heartbeat", () => {
            isAliveCheck();
        });
        ["SIGINT", "SIGTERM"].forEach((evt) => process.on(evt, () => {
            if ((0, context_1.getContext)().ready)
                logger_1.default.kernel("waiting for services....");
            if ((0, context_1.getContext)().ready)
                (0, context_1.getContext)().cleanup.dispose();
            (0, context_1.getContext)().ready = false;
            (0, context_1.getContext)().state.shutdown = true;
            isAliveCheck();
        }));
        (0, context_1.getContext)().cleanup.add("Events", () => {
            (0, context_1.getContext)().ready = false;
            (0, context_1.getContext)().state.shutdown = true;
            clearInterval(heartbeat);
        });
    });
}
exports.SystemEvents = SystemEvents;
