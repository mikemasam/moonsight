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
        if (this.current_req.__type == "ihttp") {
            return this.current_req.locals[name];
        }
        else if (this.current_req.__type == "isocket") {
            return this.current_req.socket.locals[name];
        }
        else if (this.current_req.__type == "isocketmount") {
            return this.current_req.socket.locals[name];
        }
        else if (this.current_req.__type == "icore") {
            return this.current_req.socket.locals[name];
        }
        return null;
    }
    put(name, data) {
        if (this.current_req.__type == "ihttp") {
            this.current_req.locals[name] = data;
        }
        else if (this.current_req.__type == "isocket") {
            this.current_req.socket.locals[name] = data;
        }
        else if (this.current_req.__type == "isocketmount") {
            this.current_req.socket.locals[name] = data;
        }
        else if (this.current_req.__type == "icore") {
            this.current_req.socket.locals[name] = data;
        }
    }
}
exports.RequestState = RequestState;
function CreateRequestState(req) {
    return new RequestState(req);
}
exports.default = CreateRequestState;
