/// <reference types="node" />
import { QueueOptions } from "../handlers/BaseHander";
export declare class AppState {
    events(): import("events");
    io(): import("socket.io").Namespace<import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, import("socket.io/dist/typed-events").DefaultEventsMap, any>;
    channel(): string;
    get<T>(name: string): T | undefined | null;
    put(name: string, data: any): void;
    queue(name: string, opts?: QueueOptions): Promise<false | {
        lockId: string;
        startTime: number;
        clear: () => Promise<number>;
        keepAlive: () => Promise<void>;
    }>;
    queueJob(name: string, opts?: any): boolean;
    queuePub(name: string, payload: any): boolean;
    push(name: string, data: any): void;
    remove(name: string, index: number): any;
}
export default function CreateAppState(): AppState;
