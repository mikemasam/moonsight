"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
function BasicResponse(data, opts) {
    const response = new AppResponse_1.default(data, 200, "");
    if (opts != undefined) {
        response.status =
            opts.status == null || isNaN(opts.status) ? 200 : opts.status;
        response.message = opts.message == null ? "" : opts.message;
    }
    return response;
}
exports.default = BasicResponse;
