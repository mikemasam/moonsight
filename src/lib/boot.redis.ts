import logger from "./logger";

export default async function bootRedis() {
  const ctx = global.deba_kernel_ctx;
  ctx.cleanup.add("RedisClient", async () => {
    try {
      if(!ctx.net.RedisClient) return;
      ctx.net.RedisClient.disconnect().catch((err) => err);
    } catch (er) {
      return "Err";
    }
  });
  if(!ctx.net.RedisClient) return;
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
  if(!ctx.net.RedisClient) return;
  logger.byType("pub", `new message`, payload);
  await ctx.net.RedisClient.publish(channel, JSON.stringify(payload));
};
