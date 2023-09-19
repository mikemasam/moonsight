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
Object.defineProperty(exports, "__esModule", { value: true });
exports.icore = exports.mobileitems = exports.ihttp = void 0;
const __1 = require("../../..");
//TODO: test mount
function mount(ctx, opts) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("should fix this", opts);
    });
}
exports.default = mount;
exports.ihttp = (0, __1.IHttp)((req) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.query);
    return (0, __1.Response)({ name: "this is name " });
}), []);
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
