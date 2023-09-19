"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logger_1 = __importDefault(require("../logger"));
const AsyncFn = (async () => null).constructor;
async function loadMiddlewares(location) {
    if (!location) {
        logger_1.default.byType("middleware", `Empty middleware location -> ${location}`);
        return [];
    }
    if (!fs_1.default.existsSync(`${location}`))
        throw `[KernelJs] ~ Invalid Middleware location ${location}.`;
    const middlewares = await getMiddlewares(location);
    return middlewares;
}
exports.default = loadMiddlewares;
const getMiddlewares = async (directory) => {
    const routes = fs_1.default.readdirSync(directory).map((file) => {
        const fullPath = path_1.default.join(directory, file);
        const stat = fs_1.default.statSync(fullPath);
        const _stat = {
            file: file,
            fullPath: fullPath,
            isDirectory: stat.isDirectory(),
            isFile: stat.isFile(),
        };
        return _stat;
    });
    const mids = [];
    for (let i = 0; i < routes.length; i++) {
        const stat = routes[i];
        if (stat.isDirectory) {
            const nested = await getMiddlewares(stat.fullPath);
            mids.push(...nested);
        }
        else if (stat.isFile) {
            const action = await loadMiddleware(stat.fullPath);
            if ((action === null || action === void 0 ? void 0 : action.__ihandler) != "ihttp.middleware")
                continue;
            const md = {
                name: cleanName(stat.file),
                action: action(stat),
            };
            mids.push(md);
        }
    }
    return mids;
};
const loadMiddleware = async (location) => {
    const module = await Promise.resolve(`${`${location}`}`).then(s => __importStar(require(s)));
    return module.default;
};
const cleanName = (file) => {
    return file.replace(".js", "").replace(".ts", "");
};
