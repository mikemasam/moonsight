import AppResponse from "./lib/AppResponse";

//TODO: handle no response
export default function NoResponse(): AppResponse {
  return new AppResponse(null, -1, "");
}
