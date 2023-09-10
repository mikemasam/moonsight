import logger from "../lib/logger";
import AppResponse from "./lib/AppResponse";
export default (err: Error): AppResponse => {
  logger.byType("exception", err);
  const response = new AppResponse({
    data: null,
    status: 500,
    message: typeof err == "string" ? err : "Exception occured.",
  });
  response.error = err;
  return response;
};
