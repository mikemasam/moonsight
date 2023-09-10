import { RouteResponseDataOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
export default (opts?: RouteResponseDataOpts): AppResponse => {
  return new AppResponse({
    data: opts?.data || null,
    status: opts?.status || 404,
    message: opts?.message || "Resouce not found.",
  });
};
