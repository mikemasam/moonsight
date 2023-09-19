"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
function PaginatedResponse(data, opts) {
    const response = new AppResponse_1.default(data.results, (opts === null || opts === void 0 ? void 0 : opts.status) || 200, (opts === null || opts === void 0 ? void 0 : opts.message) || "");
    response.rawData = data;
    return response;
}
exports.default = PaginatedResponse;
