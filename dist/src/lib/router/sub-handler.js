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
exports.addISubRoute = void 0;
const logger_1 = __importDefault(require("../logger"));
const addISubRoute = (stat, isub) => __awaiter(void 0, void 0, void 0, function* () {
    const endpoint = yield cleanRoutePath(stat.location);
    logger_1.default.byType("sub", `${stat.location}`, endpoint);
    isub(stat, endpoint);
});
exports.addISubRoute = addISubRoute;
//console.log(handler);
const cleanRoutePath = (file) => __awaiter(void 0, void 0, void 0, function* () {
    return file
        .replace("/index.js", "")
        .replace("/index.ts", "")
        .replace(".js", "")
        .replace(".ts", "")
        .split("/")
        .join(":");
});
