"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
function BasicResponse(data, opts) {
    const response = new AppResponse_1.default({ data, status: 200, message: "" });
    if (opts != undefined) {
        response.payload.status =
            opts.status == null || isNaN(opts.status) ? 200 : opts.status;
        response.payload.message = opts.message == null ? "" : opts.message;
    }
    response.rawData = data;
    return response;
}
exports.default = BasicResponse;
