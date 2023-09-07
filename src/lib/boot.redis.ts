import logger from "./logger";

export default async function bootRedis() {
  const ctx = global.deba_kernel_ctx;
  ctx.cleanup.add("RedisClient", async () => {
    try {
      ctx.net.RedisClient.disconnect().catch((err) => err);
    } catch (er) {
      return "Err";
    }
  });
  await ctx.net.RedisClient.connect().catch((err) => false);
  if (!ctx.net.RedisClient.isReady)
    throw new Error(`[KernelJs] ~ Redis connection failed.`);
  ctx.net.RedisClientSubscriber = ctx.net.RedisClient.duplicate();
  await ctx.net.RedisClientSubscriber.connect().catch((err: any) => false);
  if (!ctx.net.RedisClientSubscriber.isReady)
    throw new Error(`[KernelJs] ~ Redis subscriber connection failed.`);
  ctx.events.emit("kernel.internal.redis.ready");
  logger.kernel("Redis connected.");
  ctx.events.on(`kernel.subpub.pub`, redisPub);
}

const redisPub = async (channel: string, payload: any) => {
  const ctx = global.deba_kernel_ctx;
  logger.byType("pub", `new message`, payload);
  await ctx.net.RedisClient.publish(channel, JSON.stringify(payload));
};
