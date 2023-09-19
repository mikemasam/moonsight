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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.imount = exports.isocketmount = exports.isocket = exports.ihttp = void 0;
const index_1 = require("../index");
const universal_identity_1 = __importDefault(require("../lib/universal.identity"));
exports.ihttp = (0, index_1.IHttp)((req, res, AppState) => __awaiter(void 0, void 0, void 0, function* () {
    const lock = yield AppState.queue("test");
    if (lock)
        setTimeout(() => lock.clear(), 5 * 1000);
    return (0, index_1.Response)({ lock, name: "this is a name" });
}), []);
//user, business, device
exports.isocket = (0, index_1.ISocket)(({ socket, body }) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(body);
    return (0, index_1.Response)({ body, name: "this is name " });
}), ["socket.auth"]);
exports.isocketmount = (0, index_1.ISocketMount)((_a) => __awaiter(void 0, void 0, void 0, function* () {
    var { socket } = _a, req = __rest(_a, ["socket"]);
    //console.log(socket.id);
    //throw FailedResponse({ message: "Connection rejected, invalid authentication" });
}));
exports.imount = (0, index_1.IMount)((AppState) => __awaiter(void 0, void 0, void 0, function* () {
    //console.log(AppState);
    const res = universal_identity_1.default.basic(1);
    AppState.queuePub("kernel:changed2", {
        test: 1,
        res,
        text: `Connection rejected, invalid authentication " " ; : * ^ ! -- `,
    });
    AppState.queuePub("kernel:changed1", {
        test: 1,
        res,
        text: `Connection accepted, invalid authentication " " ; : * ^ ! -- `,
    });
    //console.log(UUID.latestVersion('1000....'));
    //console.log('UUID Entity', res);
}));
