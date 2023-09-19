"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppState = void 0;
const context_1 = require("../lib/context");
class AppState {
    events() {
        return (0, context_1.getContext)().events;
    }
    io() {
        return (0, context_1.getContext)().net.socketIO;
    }
    channel() {
        return (0, context_1.getContext)().opts.channelName;
    }
    //dictionary
    get(name) {
        return (0, context_1.getContext)().opts.settings[name];
    }
    put(name, data) {
        (0, context_1.getContext)().opts.settings[name] = data;
    }
    queue(name, opts) {
        return (0, context_1.getContext)().queue.aquire(name, opts);
    }
    queueJob(name, opts) {
        return (0, context_1.getContext)().events.emit(`kernel.jobs.run.${name}`, name, opts);
    }
    queuePub(name, payload) {
        return (0, context_1.getContext)().events.emit(`kernel.subpub.pub`, name, payload);
    }
    //stack
    push(name, data) {
        var _a;
        (_a = (0, context_1.getContext)().opts.settings[name]) === null || _a === void 0 ? void 0 : _a.push(data);
        console.log("AppState.push --> removed");
    }
    remove(name, index) {
        var _a;
        console.log("AppState.remove --> removed");
        return (_a = (0, context_1.getContext)().opts.settings[name]) === null || _a === void 0 ? void 0 : _a.splice(index, 1);
    }
}
exports.AppState = AppState;
function CreateAppState() {
    return new AppState();
}
exports.default = CreateAppState;
