import logger from "../lib/logger";
import AppResponse from "./lib/AppResponse";
export default (err: Error) => {
  logger.byType("exception", err);
  const response = new AppResponse(
    null,
    500,
    typeof err == "string" ? err : "Exception occured."
  );
  response.error = err;
  return response;
};
