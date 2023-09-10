import AppResponse from "./lib/AppResponse";
export default function EmptyResponse(): AppResponse {
  return new AppResponse({
    data: null,
    status: 204,
    message: "Empty response.",
  });
}
