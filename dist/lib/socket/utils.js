"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveSocketToRequestRaw = exports.makeSocketResponse = exports.makeSocketRequest = void 0;
const makeSocketRequest = (socket, event, method, __type, body, ip) => {
    var _a;
    const _ip = ip !== null && ip !== void 0 ? ip : (socket != null ? (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.address : "");
    const req = {
        method: method,
        handshake: socket == null ? null : socket.handshake,
        query: socket == null ? null : socket === null || socket === void 0 ? void 0 : socket.handshake.query,
        socket: socket,
        __type: __type,
        body,
        originalUrl: event,
        ip: _ip,
    };
    return req;
};
exports.makeSocketRequest = makeSocketRequest;
const makeSocketResponse = (fn) => {
    const res = {
        fn,
        __locals: { hooks: [], startTime: 0 },
    };
    return res;
};
exports.makeSocketResponse = makeSocketResponse;
const moveSocketToRequestRaw = (socket, ip) => {
    if (socket == null)
        return null;
    const _socket = socket;
    let _ip = "";
    if (socket.handshake) {
        _ip = socket.handshake.address;
    }
    else {
        _ip = ip;
    }
    _socket.locals = Object.assign({ ip: _ip }, _socket === null || _socket === void 0 ? void 0 : _socket.locals);
    return _socket;
};
exports.moveSocketToRequestRaw = moveSocketToRequestRaw;
