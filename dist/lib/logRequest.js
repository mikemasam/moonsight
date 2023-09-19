"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../lib/logger"));
async function logRequest(req_log, res_log, route_log) {
    let date = new Date().toLocaleString();
    date = date.slice(0, date.lastIndexOf(":") + 3);
    const logTypes = ["http", "networking"];
    const reqName = `${res_log.method} ${res_log.url} ~ ${req_log.path}`;
    const reqMs = res_log.endTime - req_log.startTime;
    if (route_log.err) {
        logger_1.default.byTypes(logTypes, `[Exception] ~ ${reqName}  `, route_log.err);
    }
    logger_1.default.byTypes(logTypes, `${reqName} ${res_log.status} ${reqMs}ms`);
}
exports.default = logRequest;
