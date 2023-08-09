import { RouteStat } from ".";
import logger from "../logger";

export const addIJobRoute = async (
  stat: RouteStat,
  ijob: (stat: RouteStat, endport: string) => void
) => {
  const endpoint = cleanRoutePath(stat.location);
  logger.byType("job", `${stat.location}`, endpoint);
  ijob(stat, endpoint);
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
