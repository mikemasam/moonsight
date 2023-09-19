"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const redis_1 = require("redis");
async function RedisInit(ctx) {
    const { opts } = ctx;
    ctx.net.RedisClient = (0, redis_1.createClient)({ url: opts.redis.url });
    return ctx;
}
exports.default = RedisInit;
