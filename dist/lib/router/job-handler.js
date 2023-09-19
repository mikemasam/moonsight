"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addIJobRoute = void 0;
const logger_1 = __importDefault(require("../logger"));
const addIJobRoute = async (stat, ijob) => {
    const endpoint = cleanRoutePath(stat.location);
    logger_1.default.byType("job", `${stat.location}`, endpoint);
    ijob(stat, endpoint);
};
exports.addIJobRoute = addIJobRoute;
//console.log(handler);
const cleanRoutePath = (file) => {
    return file
        .replace("/index.js", "")
        .replace("/index.ts", "")
        .replace(".js", "")
        .replace(".ts", "")
        .split("/")
        .join(":");
};
