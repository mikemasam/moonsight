"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const zod_validation_error_1 = require("zod-validation-error");
function HttpUtils(req, res) {
    function parseBody(schema) {
        let output = schema.safeParse(req.body);
        if (!output.success) {
            throw (0, zod_validation_error_1.fromZodError)(output.error).message;
        }
        return output.data;
    }
    return { parseBody };
}
exports.default = HttpUtils;
