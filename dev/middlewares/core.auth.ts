import { FailedResponse, IHttpMiddleware } from "../../src";

export default IHttpMiddleware(async (ctx, req, res) => {
  console.log("core.auth")
  //return res.failed({ status: 401, message: 'Core Auth failed' });
})
