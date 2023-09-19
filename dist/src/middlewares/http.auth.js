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
const index_js_1 = require("../responders/index.js");
exports.default = (state, req, res, args, addHook) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(state.get('test'));
    addHook(paginationHook);
    //return FailedResponse({ status: 401, message: 'Auth failed' });
});
const paginationHook = (data) => __awaiter(void 0, void 0, void 0, function* () {
    return {
        data: data.results,
        page: {
            page: 1,
            pageSize: 2,
            total: (data === null || data === void 0 ? void 0 : data.total) || 0
        }
    };
});
