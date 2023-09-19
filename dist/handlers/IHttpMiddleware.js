"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const AsyncFn = (async () => null).constructor;
function IHttpMiddleware(handler) {
    function iHttpHandler(stat) {
        //if (handler instanceof AsyncFn !== true)
        //throw `[KernelJs] ~ ${stat.fullPath} async handler function is required.`;
        return handler;
    }
    iHttpHandler.__ihandler = "ihttp.middleware";
    return iHttpHandler;
}
exports.default = IHttpMiddleware;
