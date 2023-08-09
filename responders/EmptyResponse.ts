import AppResponse from "./lib/AppResponse";
export default function EmptyResponse(): AppResponse {
  return new AppResponse(null, 204, "Empty response.");
}
