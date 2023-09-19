"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const addHook = (res) => {
    return (hook) => {
        res.__locals.hooks.push(hook);
    };
};
exports.default = addHook;
