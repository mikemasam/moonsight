import { FailedResponse } from "../../src";

export default async (ctx, req, res) => {
  return FailedResponse({ status: 401, message: 'Core Auth failed' });
}
