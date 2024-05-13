import { RouteStat } from "../../handlers/BaseHander";
import logger from "../logger";

export const addIConsoleRoute = async (
  stat: RouteStat,
  iconsole: (stat: RouteStat, _endpoint: string) => void
) => {
  const endpoint = cleanRoutePath(stat.location);
  logger.byType("console", `${stat.location}`, endpoint);
  iconsole(stat, endpoint);
};
//console.log(handler);

const cleanRoutePath = (file: string) => {
  return file
    .replace("/index.js", "")
    .replace("/index.ts", "")
    .replace(".js", "")
    .replace(".ts", "")
    .split("/")
    .join(":");
};
