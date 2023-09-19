import { Socket as ServerSocket } from "socket.io";
import { Socket as ClientSocket } from "socket.io-client";
import { SocketRequest, SocketRequestRaw, SocketResponse } from "../../handlers/BaseHander";
export declare const makeSocketRequest: (socket: SocketRequestRaw, event: string, method: "icore" | "isocket" | "isocketmount", __type: "icore" | "isocket" | "isocketmount", body: any, ip?: string) => SocketRequest;
export declare const makeSocketResponse: (fn: (content: any) => void) => SocketResponse;
export declare const moveSocketToRequestRaw: (socket: ServerSocket | ClientSocket, ip?: string) => SocketRequestRaw;
