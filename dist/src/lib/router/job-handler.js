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
exports.addIJobRoute = void 0;
const logger_1 = __importDefault(require("../logger"));
const addIJobRoute = (stat, ijob) => __awaiter(void 0, void 0, void 0, function* () {
    const endpoint = cleanRoutePath(stat.location);
    logger_1.default.byType("job", `${stat.location}`, endpoint);
    ijob(stat, endpoint);
});
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
