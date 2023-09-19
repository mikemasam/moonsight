import CoreNetQuery from "./query";
import { Socket } from "socket.io-client";
export default class CoreNetSelector {
    socket?: Socket;
    ready: boolean | null;
    isLocal: boolean;
    queue: (() => void)[];
    connectRemote(): this;
    connectLocal(): this;
    _handleAll(...args: any[]): void;
    _disconnected(reason: string): void;
    _connected(): void;
    clearQueue(): void;
    isConnected(): boolean | undefined;
    select(channel?: string): CoreNetQuery;
    query(dpath: string, body: Object): Promise<unknown>;
}
