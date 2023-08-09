import logger from "../lib/logger";
import { getContext } from "../lib/context";
import { RouteStat } from "../lib/router/index";
import CreateAppState, { AppState } from "../lib/AppState";

export type ISubHandler = (state: AppState, channel: string, a: Object) => void;
export type ISubHandlerRoute = {
  (stat: RouteStat, name: string): void;
  __ihandler: string;
};
async function listen(channels: string[], handler: ISubHandler) {
  await getContext().net.RedisClientSubscriber.subscribe(
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
): ISubHandlerRoute {
  function iSubHandler(stat: RouteStat, name: string): void {
    if (!Array.isArray(channels))
      throw `ISub: [${stat.path}] channels should an a string array`;
    getContext().events.once("kernel.corenet.ready", () =>
      listen(channels, handler)
    );
  }
  iSubHandler.__ihandler = "isub";
  return iSubHandler;
}
