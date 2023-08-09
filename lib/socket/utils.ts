import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import {
  SocketRequest,
  SocketRequestRaw,
  SocketResponse,
} from "../../handlers/BaseHander";

export const makeSocketRequest = (
  socket: SocketRequestRaw,
  event: string,
  method: "icore" | "isocket" | "isocketmount",
  __type: "icore" | "isocket" | "isocketmount",
  body: any,
  ip?: string
) => {
  const _ip = ip != undefined ? ip : socket.handshake?.address;
  const req: SocketRequest = {
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
export const makeSocketResponse = (fn: (content: any) => void) => {
  const res: SocketResponse = {
    fn,
    __locals: { hooks: [], startTime: 0 },
  };
  return res;
};

export const moveSocketToRequestRaw = (
  socket: ServerSocket | ClientSocket,
  ip?: string
) => {
  const _socket = socket as SocketRequestRaw;
  let _ip: string = ip!!;
  if ((socket as ServerSocket).handshake)
    _ip = (socket as ServerSocket).handshake.address;
  _socket.locals = { ip: _ip, ..._socket?.locals };
  return _socket;
};
