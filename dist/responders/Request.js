"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestState = void 0;
class RequestState {
    constructor(req) {
        this.current_req = req;
    }
    req() {
        return this.current_req;
    }
    get(name) {
        var _a;
        const _type = this.current_req.__type;
        if (_type == "ihttp") {
            return this.current_req.locals[name];
        }
        else if (_type == "isocket" ||
            _type == "isocketmount" ||
            _type == "icore") {
            return (_a = this.current_req.socket) === null || _a === void 0 ? void 0 : _a.locals[name];
        }
        return undefined;
    }
    put(name, data) {
        const _type = this.current_req.__type;
        if (_type == "ihttp") {
            this.current_req.locals[name] = data;
        }
        else if (_type == "isocket" ||
            _type == "isocketmount" ||
            _type == "icore") {
            if (this.current_req.socket)
                this.current_req.socket.locals[name] = data;
        }
    }
}
exports.RequestState = RequestState;
function CreateRequestState(req) {
    return new RequestState(req);
}
exports.default = CreateRequestState;
