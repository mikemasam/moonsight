import { createClient } from 'redis';

export default async function RedisInit(ctx) {
  const { opts } = ctx;
  ctx.net.RedisClient = createClient({ url: opts.redis.url });
  return ctx;
}
