import { createClient } from "redis";
import logger from "./logger.js";
import { AppContext } from "./context.js";

export default async function RedisInit(ctx: AppContext) {
  const { opts } = ctx;
  ctx.net.RedisClient = createClient({ url: opts.redis.url });

  return ctx;
}
