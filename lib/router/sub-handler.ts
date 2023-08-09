import { RouteStat } from ".";
import { ISubHandlerRoute } from "../../handlers/ISub";
import logger from "../logger";

export const addISubRoute = async (stat: RouteStat, isub: ISubHandlerRoute) => {
  const endpoint = await cleanRoutePath(stat.location);
  logger.byType("sub", `${stat.location}`, endpoint);
  isub(stat, endpoint);
};
//console.log(handler);

const cleanRoutePath = async (file: string) => {
  return file
    .replace("/index.js", "")
    .replace("/index.ts", "")
    .replace(".js", "")
    .replace(".ts", "")
    .split("/")
    .join(":");
};
