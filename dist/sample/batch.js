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
exports.ihttp = void 0;
const __1 = require("..");
const http1 = (params) => __awaiter(void 0, void 0, void 0, function* () {
    return { name: "this is a http" };
});
//TODO: test batch
const http2 = (params) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("should test");
    return { name: "this is a http", params };
});
exports.ihttp = (0, __1.IBatchHttp)({ http1, http2 }, []);
//const _req = {
//  payments: { search: '' }
//  today_payments: { },
//  today_sales: {}
//}
//const _res = {
//  payments: { results, page }
//  today_payments: { results, page },
//  today_sales: { results, page }
//}
//const allpayments = async (body, state, appState);
//const h = {
//  payments: allpayments
//};
