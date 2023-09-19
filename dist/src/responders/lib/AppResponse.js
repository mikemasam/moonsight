"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const JsonResponder_1 = __importDefault(require("./JsonResponder"));
class AppResponse {
    constructor(data, status, message) {
        this.rawData = null;
        this.responder = true;
        this.data = data;
        this.status = status;
        this.message = message;
    }
    json(log, req, res) {
        return new JsonResponder_1.default(this, log, req, res);
    }
}
exports.default = AppResponse;
