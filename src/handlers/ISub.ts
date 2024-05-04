import logger from "../lib/logger";
import { getContext } from "../lib/context";
import CreateAppState, { AppState } from "../lib/AppState";
import { IHandler, RouteStat } from "./BaseHander";
import { getRedisClientSubscriber } from "../lib/redis";

export type ISubHandler = (state: AppState, channel: string, a: Object) => void;
//export type ISubHandlerRoute = {
//  (stat: RouteStat, name: string): void;
//  __ihandler: string;
//};
async function listen(channels: string[], handler: ISubHandler) {
  await getRedisClientSubscriber().subscribe(
    channels,
    (message: string, channel: string) => {
      logger.byType("sub", `new message`, message);
      handler(CreateAppState(), channel, JSON.parse(message));
    }
  );
}
export default function ISub(
  handler: ISubHandler,
  channels: string[],
  opts?: any
): IHandler<void> {
  function iSubHandler(stat: RouteStat): void {
    if (!Array.isArray(channels))
      throw `ISub: [${stat.path}] channels should an a string array`;
    getContext().events.once("kernel.corenet.ready", () =>
      listen(channels, handler)
    );
  }
  iSubHandler.__ihandler = "isub";
  return iSubHandler;
}
