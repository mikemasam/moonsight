import { RouteResponseOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
export default function OkResponse(
  data: Object | string | number | null | boolean,
  opts?: RouteResponseOpts,
): AppResponse {
  const response = new AppResponse({ data, status: 200, message: "" });
  if (opts != undefined) {
    response.payload.status =
      opts.status == null || isNaN(opts.status) ? 200 : opts.status;
    response.payload.message = opts.message == null ? "" : opts.message;
  }
  response.rawData = data;
  return response;
}

export type OkResponse  = typeof OkResponse;
