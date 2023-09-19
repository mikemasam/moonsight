import CoreNetQuery from "./query";
import { Socket } from "socket.io-client";
import { CoreResponse } from "../../handlers/BaseHander";
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
    query<T>(dpath: string, body: Object): Promise<CoreResponse<T>>;
}
