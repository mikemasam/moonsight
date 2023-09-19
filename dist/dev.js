"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const path_1 = __importDefault(require("path"));
(0, index_1.default)({
    host: "localhost",
    version: "1.0.0",
    autoBoot: true,
    coreHost: "localhost:5000",
    port: 3003,
    mocking: false,
    apiPath: path_1.default.resolve("sample"),
    apiMount: "api",
    apiMiddlewares: path_1.default.resolve("middlewares"),
    channelName: "test",
    nodeIdentity: "111",
    mountCore: {
        allowedIPs: "127.0.0.1, 0.0.0.0, 172.27.208.1",
        port: 5555,
        mount: false,
    },
    redis: {
        url: "redis://localhost:6379",
    },
    settings: {
        test: "testing",
    },
    logging: {
        pub: true,
        sub: true,
        all: true,
    },
}).then((e) => {
    //console.log(e);
});
