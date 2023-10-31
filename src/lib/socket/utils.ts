import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import {
  SocketRequest,
  SocketRequestRaw,
  SocketResponse,
} from "../../handlers/BaseHander";

export const makeSocketRequest = (
  socket: SocketRequestRaw | null,
  event: string,
  method: "icore" | "isocket" | "isocketmount",
  __type: "icore" | "isocket" | "isocketmount",
  body: any,
  ip?: string,
) => {
  const _ip: string = ip ?? (socket != null ? socket.handshake?.address : "");
  const req: SocketRequest = {
    method: method,
    handshake: socket == null ? null : socket.handshake,
    query: socket == null ? null : socket?.handshake?.query,
    socket: socket,
    __type: __type,
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
  socket: ServerSocket | ClientSocket | null,
  ip?: string,
): SocketRequestRaw | null => {
  if (socket == null) return null;
  //const _socket = socket as SocketRequestRaw;
  let _ip: string = "";
  if ((socket as ServerSocket).handshake) {
    _ip = (socket as ServerSocket).handshake.address;
  } else {
    _ip = ip!!;
  }
  socket.locals = { ip: _ip, ...socket?.locals };
  return socket as SocketRequestRaw;
};
