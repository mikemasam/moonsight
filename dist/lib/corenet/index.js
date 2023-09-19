"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreNet = void 0;
const net_1 = __importDefault(require("./net"));
const CoreNet = new net_1.default();
exports.CoreNet = CoreNet;
exports.default = async () => {
    const ctx = global.deba_kernel_ctx;
    const { mountCore, coreHost } = ctx.opts;
    if (coreHost) {
        ctx.net.coreNet = CoreNet.connectRemote();
    }
    else if (mountCore === null || mountCore === void 0 ? void 0 : mountCore.mount) {
        ctx.net.coreNet = CoreNet.connectLocal();
    }
    return ctx;
};
