"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.moveSocketToRequestRaw = exports.makeSocketResponse = exports.makeSocketRequest = void 0;
const makeSocketRequest = (socket, event, method, __type, body, ip) => {
    var _a;
    const _ip = ip != undefined ? ip : (_a = socket.handshake) === null || _a === void 0 ? void 0 : _a.address;
    const req = {
        method: method,
        handshake: socket.handshake,
        query: socket.handshake.query,
        __type: __type,
        socket,
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
    const _socket = socket;
    let _ip = ip;
    if (socket.handshake)
        _ip = socket.handshake.address;
    _socket.locals = Object.assign({ ip: _ip }, _socket === null || _socket === void 0 ? void 0 : _socket.locals);
    return _socket;
};
exports.moveSocketToRequestRaw = moveSocketToRequestRaw;
