"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const index_js_1 = require("../responders/index.js");
exports.default = async (state, req, res, args, addHook) => {
    console.log(state.get('test'));
    addHook(paginationHook);
    //return FailedResponse({ status: 401, message: 'Auth failed' });
};
const paginationHook = async (data) => {
    return {
        data: data.results,
        page: {
            page: 1,
            pageSize: 2,
            total: (data === null || data === void 0 ? void 0 : data.total) || 0
        }
    };
};
