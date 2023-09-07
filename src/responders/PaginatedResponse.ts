import { RouteResponseOpts } from "../handlers/BaseHander";
import AppResponse from "./lib/AppResponse";
type PaginatedResult<T> = {
  results: T[];
};
export default function PaginatedResponse<T>(
  data: PaginatedResult<T>,
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
