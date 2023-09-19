import { Socket } from "socket.io-client";
import CoreNetSelector from "./net";
export default class CoreNetQuery {
    private selector;
    private channel;
    constructor(selector: CoreNetSelector, channel: string);
    dpathQuery(dpath: string, body: Object): Promise<unknown>;
    query(event: string, body: Object): Promise<unknown>;
    _query(event: string, body: Object): Promise<unknown>;
    __remoteQuery(event: string, body: Object): Promise<unknown>;
    __localQuery(event: string, body: Object): Promise<unknown>;
    __handleFailed(socket: Socket | null, event: string, body: Object, fn: (a: unknown) => void, status?: number): Promise<import("../../responders/lib/JsonResponder").default>;
}
