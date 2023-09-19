"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addISubRoute = void 0;
//import { ISubHandlerRoute } from "../../handlers/ISub";
const logger_1 = __importDefault(require("../logger"));
const addISubRoute = async (stat, isub) => {
    const endpoint = await cleanRoutePath(stat.location);
    logger_1.default.byType("sub", `${stat.location}`, endpoint);
    isub(stat);
};
exports.addISubRoute = addISubRoute;
//console.log(handler);
const cleanRoutePath = async (file) => {
    return file
        .replace("/index.js", "")
        .replace("/index.ts", "")
        .replace(".js", "")
        .replace(".ts", "")
        .split("/")
        .join(":");
};
