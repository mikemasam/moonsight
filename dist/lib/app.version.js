"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function app$version(opts) {
    if (!opts.version)
        throw "Version is number is required";
    return opts.version;
}
exports.default = app$version;
