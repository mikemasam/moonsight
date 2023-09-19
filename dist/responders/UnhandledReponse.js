"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../lib/logger"));
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
exports.default = (err) => {
    logger_1.default.byType("exception", err);
    const response = new AppResponse_1.default({
        data: null,
        status: 500,
        message: typeof err == "string" ? err : "Exception occured.",
    });
    response.error = err;
    return response;
};
