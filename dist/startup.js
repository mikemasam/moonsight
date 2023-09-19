"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @Deprecated -- see dev.js
//copy this to your new project as index
//to start 
//#> node index.js
const path_1 = __importDefault(require("path"));
const index_js_1 = __importDefault(require("./index.js"));
const context = await (0, index_js_1.default)({
    apiPath: path_1.default.resolve('sample'),
    apiMount: 'api',
    middlewares: path_1.default.resolve('middlewares'),
    port: 8080,
    nodeIdentity: 800,
    channelName: 'Test1',
    coreHost: 'http://localhost:5000',
    mountCore: {
        allowedIPs: ['0.0.0.0'],
        mount: false
    },
    settings: {
        test: 'testing'
    },
    redis: {
        url: undefined
    },
    logging: {
        error: true,
        http: false,
        socket: false,
        core: false
    }
});
