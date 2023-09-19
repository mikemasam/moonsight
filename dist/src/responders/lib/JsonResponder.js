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
const logRequest_1 = __importDefault(require("../../lib/logRequest"));
class JsonResponder {
    constructor(appRes, req_log, req, res) {
        this.logs = {};
        this.appRes = appRes;
        this.req_log = req_log;
        this.req = req;
        this.res = res;
        this.logs.err = appRes.error;
    }
    socket() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.appRes.status == -1)
                return;
            yield this.postHooks();
            const res_log = this.makeLog();
            (0, logRequest_1.default)(this.req_log, res_log, this.logs);
            this.res.fn({
                data: this.appRes.data,
                status: this.appRes.status,
                message: this.appRes.message,
                success: this.appRes.status == 200,
            });
        });
    }
    http() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.appRes.status == -1)
                return;
            yield this.postHooks();
            const res_log = this.makeLog();
            (0, logRequest_1.default)(this.req_log, res_log, this.logs);
            this.res.json({
                data: this.appRes.data,
                status: this.appRes.status,
                message: this.appRes.message,
                success: this.appRes.status == 200,
            });
        });
    }
    makeLog() {
        return {
            method: this.req.method,
            ip: this.req.ip,
            url: this.req.originalUrl,
            status: this.appRes.status || 0,
            endTime: Date.now(),
        };
    }
    postHooks() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.res.__locals) {
                let hooks = this.res.__locals.hooks.reverse();
                while (hooks.length) {
                    const hook = hooks.pop();
                    const changes = yield hook(this.appRes.rawData);
                    this.appRes.data = Object.assign(Object.assign({}, this.appRes.data), changes);
                }
            }
        });
    }
}
exports.default = JsonResponder;
