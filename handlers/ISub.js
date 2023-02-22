import { AppState } from '../responders/index.js';
import logger from '../lib/logger.js';

async function listen(ctx, channels, handler){
  await ctx.net.RedisClientSubscriber.subscribe(channels, (message, channel) => {
    logger.byType('sub',`new message`, message);
    handler(channel, JSON.parse(message));
  });
}
export default function ISub(handler, channels, opts){
  function ISubHandler(ctx, stat, name){
    if(!Array.isArray(channels)) throw `ISub: [${stat._path}] channels should an a string array`;
    ctx.events.once("kernel.corenet.ready", () => listen(ctx, channels, handler))
  }
  ISubHandler.__ihandler = 'isub';
  return ISubHandler;
}
