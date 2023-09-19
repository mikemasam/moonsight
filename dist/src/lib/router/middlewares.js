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
exports.loadMiddlewares = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const AsyncFn = (() => __awaiter(void 0, void 0, void 0, function* () { return null; })).constructor;
const loadMiddlewares = (location) => __awaiter(void 0, void 0, void 0, function* () {
    if (!location)
        return [];
    if (!fs_1.default.existsSync(`${location}`))
        throw `[KernelJs] ~ Invalid Middleware location ${location}.`;
    const middlewares = yield getMiddlewares(location);
    return middlewares;
});
exports.loadMiddlewares = loadMiddlewares;
const getMiddlewares = (directory) => __awaiter(void 0, void 0, void 0, function* () {
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
            const nested = yield getMiddlewares(stat.fullPath);
            mids.push(...nested);
        }
        else if (stat.isFile) {
            const action = yield loadMiddleware(stat.fullPath);
            const md = {
                name: cleanName(stat.file),
                action,
            };
            mids.push(md);
        }
    }
    return mids;
});
const loadMiddleware = (location) => __awaiter(void 0, void 0, void 0, function* () {
    const module = yield Promise.resolve(`${`${location}`}`).then(s => __importStar(require(s)));
    if (module.default instanceof AsyncFn !== true)
        throw `[KernelJs] ~ ${location} middleware doesn't return async handler function.`;
    return module.default;
});
const cleanName = (file) => {
    return file.replace(".js", "").replace("ts", "");
};
