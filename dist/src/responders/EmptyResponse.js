"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const AppResponse_1 = __importDefault(require("./lib/AppResponse"));
function EmptyResponse() {
    return new AppResponse_1.default(null, 204, "Empty response.");
}
exports.default = EmptyResponse;
