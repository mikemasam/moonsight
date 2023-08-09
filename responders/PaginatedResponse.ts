import { RouteResponseOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
type PaginatedResult = {
  results: [];
};
export default function PaginatedResponse(
  data: PaginatedResult,
  opts?: RouteResponseOpts
): AppResponse {
  const response = new AppResponse(
    data.results,
    opts?.status || 200,
    opts?.message || ""
  );
  response.rawData = data;
  return response;
}
