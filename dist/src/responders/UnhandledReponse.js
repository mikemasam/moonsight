"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
exports.default = (err) => {
    const response = new AppResponse_1.default(null, 500, typeof err == "string" ? err : "Exception occured.");
    response.error = err;
    return response;
};
