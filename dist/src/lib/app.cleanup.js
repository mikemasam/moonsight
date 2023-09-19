"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const logger_1 = __importDefault(require("./logger"));
function AppCleanup() {
    const cleanups = [];
    const add = (name, action) => {
        cleanups.push({ name, action });
    };
    const dispose = () => {
        for (let i = 0; i < cleanups.length; i++) {
            const cl = cleanups[i];
            Promise.resolve(cl.action())
                .then(() => {
                logger_1.default.kernel(`cleaning up ${cl.name}`);
            })
                .catch((er) => {
                logger_1.default.kernel(`cleaning up ${cl.name} - Error ${er}`);
            });
        }
    };
    return {
        add,
        dispose,
    };
}
exports.default = AppCleanup;
