"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("../lib/logger"));
function logRequest(req_log, res_log, app_log) {
    return __awaiter(this, void 0, void 0, function* () {
        let date = Date().toString();
        date = date.slice(0, date.lastIndexOf(":") + 3);
        const logTypes = ["http", "networking"];
        const reqName = `${res_log.method} ${res_log.url} ~ ${req_log.path}`;
        const reqMs = res_log.endTime - req_log.startTime;
        if (!app_log.err) {
            logger_1.default.byTypes(logTypes, `[${date}]  ${reqName} ${res_log.status} ${reqMs}ms`);
        }
        else if (app_log.err)
            logger_1.default.byTypes(logTypes, `[Exception] ~ ${reqName}  `, app_log.err);
    });
}
exports.default = logRequest;
