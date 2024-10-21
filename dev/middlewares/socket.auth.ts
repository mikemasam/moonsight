import { FailedResponse } from "../../src";

export default async (ctx, req, res) => {
  return res.failed({ status: 401, message: 'Auth failed' });
}
