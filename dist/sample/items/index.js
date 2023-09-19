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
exports.icore = exports.mobileitems = exports.ihttp = exports.isub = void 0;
const __1 = require("../..");
const IHttp_1 = __importDefault(require("../../handlers/IHttp"));
const ISocket_1 = __importDefault(require("../../handlers/ISocket"));
const corenet_1 = require("../../lib/corenet");
const ihttp = (0, IHttp_1.default)(() => __awaiter(void 0, void 0, void 0, function* () {
    return (0, __1.FailedResponse)();
}), []);
exports.ihttp = ihttp;
const mobileitems = (0, ISocket_1.default)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("testing ....", body);
    const res = yield corenet_1.CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return (0, __1.Response)({ name: "this is name " });
}), ["socket.auth"]);
exports.mobileitems = mobileitems;
const icore = (0, __1.ICore)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("testing ....", body);
    const res = yield corenet_1.CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return (0, __1.Response)({ name: "this is name " });
}), ["core.auth"]);
exports.icore = icore;
const channels = [
    "deba.market:products:changed1",
    "deba.market:products:changed2",
];
const isub = (0, __1.ISub)((appState, channel, payload) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log(channel);
    //console.log("product changed", payload);
}), channels);
exports.isub = isub;
