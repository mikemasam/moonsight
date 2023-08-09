import AppResponse from "./lib/AppResponse";
export default (err: Error) => {
  const response = new AppResponse(
    null,
    500,
    typeof err == "string" ? err : "Exception occured."
  );
  response.error = err;
  return response;
};
