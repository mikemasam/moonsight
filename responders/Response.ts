import { RouteResponseOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
export default function BasicResponse(
  data: Object,
  opts?: RouteResponseOpts
): AppResponse {
  const response = new AppResponse(data, 200, "");
  if (opts != undefined) {
    response.status =
      opts.status == null || isNaN(opts.status) ? 200 : opts.status;
    response.message = opts.message == null ? "" : opts.message;
  }
  return response;
}
