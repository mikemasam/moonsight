"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
async function bootRedis() {
    const ctx = global.deba_kernel_ctx;
    ctx.cleanup.add("RedisClient", async () => {
        try {
            ctx.net.RedisClient.disconnect().catch((err) => err);
        }
        catch (er) {
            return "Err";
        }
    });
    await ctx.net.RedisClient.connect().catch((err) => false);
    if (!ctx.net.RedisClient.isReady)
        throw new Error(`[KernelJs] ~ Redis connection failed.`);
    ctx.net.RedisClientSubscriber = ctx.net.RedisClient.duplicate();
    await ctx.net.RedisClientSubscriber.connect().catch((err) => false);
    if (!ctx.net.RedisClientSubscriber.isReady)
        throw new Error(`[KernelJs] ~ Redis subscriber connection failed.`);
    ctx.events.emit("kernel.internal.redis.ready");
    logger_1.default.kernel("Redis connected.");
    ctx.events.on(`kernel.subpub.pub`, redisPub);
}
exports.default = bootRedis;
const redisPub = async (channel, payload) => {
    const ctx = global.deba_kernel_ctx;
    logger_1.default.byType("pub", `new message`, payload);
    await ctx.net.RedisClient.publish(channel, JSON.stringify(payload));
};
