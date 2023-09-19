"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logRequest_1 = __importDefault(require("../../lib/logRequest"));
class JsonResponder {
    constructor(appRes, req_log, req, res) {
        this.route_log = {};
        this.appRes = appRes;
        this.req_log = req_log;
        this.req = req;
        this.res = res;
        this.route_log.err = appRes.error;
    }
    responsePayload() {
        return Object.assign(Object.assign({}, this.appRes.payload), { success: this.appRes.payload.status == 200 });
    }
    async socket() {
        if (this.appRes.payload.status == -1)
            return;
        await this.postHooks();
        const res_log = this.makeLog();
        (0, logRequest_1.default)(this.req_log, res_log, this.route_log);
        this.res.fn(this.responsePayload());
    }
    async http() {
        if (this.appRes.payload.status == -1)
            return;
        await this.postHooks();
        const res_log = this.makeLog();
        (0, logRequest_1.default)(this.req_log, res_log, this.route_log);
        this.res.json(this.responsePayload());
    }
    makeLog() {
        return {
            method: this.req.method,
            ip: this.req.ip,
            url: this.req.originalUrl,
            status: this.appRes.payload.status || 0,
            endTime: Date.now(),
        };
    }
    //TODO: handle postHook exceptions
    async postHooks() {
        if (this.res.__locals) {
            let hooks = this.res.__locals.hooks.reverse();
            const status = this.responsePayload();
            while (hooks.length) {
                const hook = hooks.pop();
                const changes = await hook(this.appRes.rawData, status);
                this.appRes.payload = Object.assign(Object.assign({}, this.appRes.payload), changes);
            }
        }
    }
}
exports.default = JsonResponder;
