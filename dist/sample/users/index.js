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
exports.ijob = exports.icore = exports.isocket = void 0;
const __1 = require("../..");
const ISocket_1 = __importDefault(require("../../handlers/ISocket"));
exports.isocket = (0, ISocket_1.default)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(":api:users: isocket body", body);
    return (0, __1.Response)({ name: "this is name " });
}), ["socket.auth"]);
exports.icore = (0, __1.ICore)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("users - ", body);
    return (0, __1.Response)({ name: "this is name " });
}), ["core.auth"]);
// config
// - schedule
// - not busy
// -
const job = (appState, c) => __awaiter(void 0, void 0, void 0, function* () {
    //CoreJob.queue("api:users", { hi: 1 });
    //return IJob.BACKOFF;
    //console.log("Job called");
    //AppState.queueJob(":api:users", { i: 0 });
    //throw new Error("112121");
    console.log(c);
    return [__1.IJob.OK, "Just like that"];
});
exports.ijob = (0, __1.IJob)(job, { seconds: 3, instant: true }, { hi: 0 });
