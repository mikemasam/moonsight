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
  ctx.net.bootRedis = async () => {
    await ctx.net.RedisClient.connect().catch(err => false);
    if(!ctx.net.RedisClient.isReady) throw new Error(`[KernelJs] ~ Redis connection failed.`);
    else {
      ctx.events.emit("kernel.internal.redis.ready");
      logger.kernel("Redis connected.");
    }
  }
  return ctx;
}
