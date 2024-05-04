import { RedisClientType, createClient } from "redis";
import logger from "./logger.js";
import { AppContext, getContext } from "./context.js";

export default async function RedisInit(ctx: AppContext) {
  const { opts } = ctx;
  if(!opts.redis) return ctx;
  ctx.net.RedisClient = createClient({ url: opts.redis.url });

  return ctx;
}

export function getRedisClient(): RedisClientType {
  const client = getContext()
    .net.RedisClient;
  if(!client) throw new Error("Redis not configured for queue, lock and more");
  return client;
}

export function getRedisClientSubscriber(): RedisClientType {
  const client = getContext().net.RedisClientSubscriber;
  if(!client)  throw new Error("Redis not configured for queue, lock and more");
  return client;
} 
