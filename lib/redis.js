import { createClient } from 'redis';
import logger from './logger.js';

export default async function RedisInit(ctx) {
  const { opts } = ctx;
  ctx.net.RedisClient = createClient({ url: opts.redis.url });
  ctx.cleanup.add("RedisClient", async () => {
    try {
     ctx.net.RedisClient.disconnect().catch(err => err)
    }catch(er){
      return "Err";
    }
  });

  const redisPub = async (channel, payload) => {
    logger.byType('pub',`new message`, payload);
    await ctx.net.RedisClient.publish(channel, JSON.stringify(payload));
  }
  ctx.net.bootRedis = async () => {
    await ctx.net.RedisClient.connect().catch(err => false);
    if(!ctx.net.RedisClient.isReady) throw new Error(`[KernelJs] ~ Redis connection failed.`);
    ctx.net.RedisClientSubscriber = ctx.net.RedisClient.duplicate();
    await ctx.net.RedisClientSubscriber.connect().catch(err => false);
    if(!ctx.net.RedisClientSubscriber.isReady) throw new Error(`[KernelJs] ~ Redis subscriber connection failed.`);
    ctx.events.emit("kernel.internal.redis.ready");
    logger.kernel("Redis connected.");
    ctx.events.on(`kernel.subpub.pub`, redisPub)
  }
  return ctx;
}
