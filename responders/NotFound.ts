import { RouteResponseDataOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
export default (opts?: RouteResponseDataOpts) => {
  return new AppResponse(
    opts?.data || null,
    opts?.status || 404,
    opts?.message || "Resouce not found."
  );
};
