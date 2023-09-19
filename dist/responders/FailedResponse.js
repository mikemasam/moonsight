"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
//  data = {},
//  message = "failed",
//  status = 400,
exports.default = (opts) => {
    return new AppResponse_1.default({
        data: (opts === null || opts === void 0 ? void 0 : opts.data) || null,
        status: (opts === null || opts === void 0 ? void 0 : opts.status) || 400,
        message: (opts === null || opts === void 0 ? void 0 : opts.message) || "Failed",
    });
};
