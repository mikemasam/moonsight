import z from "zod";
import { fromZodError } from "zod-validation-error";
import {
  HttpRequest,
  HttpRequestUtils,
  HttpResponse,
} from "../handlers/BaseHander";

export default function HttpUtils(
  req: HttpRequest,
  res: HttpResponse
): HttpRequestUtils {
  function parseBody(schema: z.ZodType) {
    let output = schema.safeParse(req.body);
    if (!output.success) {
      throw fromZodError(output.error).message;
    }
    return output.data;
  }
  return { parseBody };
}
