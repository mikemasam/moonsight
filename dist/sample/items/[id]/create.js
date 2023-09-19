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
exports.icore = exports.mobileitems = exports.ihttp = void 0;
const __1 = require("../../..");
const IHttp_1 = __importDefault(require("../../../handlers/IHttp"));
exports.ihttp = (0, IHttp_1.default)((req) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.params);
    console.log(req.query);
    return (0, __1.Response)({ name: "this is name " });
}), ["http.auth"]);
exports.mobileitems = (0, __1.ISocket)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("testing ....", body);
    const res = yield __1.CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return (0, __1.Response)({ name: "this is name " });
}), ["socket.auth"]);
exports.icore = (0, __1.ICore)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("testing ....", body);
    const res = yield __1.CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return (0, __1.Response)({ name: "this is name " });
}), ["core.auth"]);
