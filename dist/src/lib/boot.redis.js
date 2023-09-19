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
const logger_1 = __importDefault(require("./logger"));
function bootRedis() {
    return __awaiter(this, void 0, void 0, function* () {
        const ctx = global.deba_kernel_ctx;
        ctx.cleanup.add("RedisClient", () => __awaiter(this, void 0, void 0, function* () {
            try {
                ctx.net.RedisClient.disconnect().catch((err) => err);
            }
            catch (er) {
                return "Err";
            }
        }));
        yield ctx.net.RedisClient.connect().catch((err) => false);
        if (!ctx.net.RedisClient.isReady)
            throw new Error(`[KernelJs] ~ Redis connection failed.`);
        ctx.net.RedisClientSubscriber = ctx.net.RedisClient.duplicate();
        yield ctx.net.RedisClientSubscriber.connect().catch((err) => false);
        if (!ctx.net.RedisClientSubscriber.isReady)
            throw new Error(`[KernelJs] ~ Redis subscriber connection failed.`);
        ctx.events.emit("kernel.internal.redis.ready");
        logger_1.default.kernel("Redis connected.");
        ctx.events.on(`kernel.subpub.pub`, redisPub);
    });
}
exports.default = bootRedis;
const redisPub = (channel, payload) => __awaiter(void 0, void 0, void 0, function* () {
    const ctx = global.deba_kernel_ctx;
    logger_1.default.byType("pub", `new message`, payload);
    yield ctx.net.RedisClient.publish(channel, JSON.stringify(payload));
});
