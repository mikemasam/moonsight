import { QueueOptions } from "../handlers/BaseHander";
type IQueueLock = {
    lockId: string;
    startTime: number;
    clear: () => Promise<number>;
    keepAlive: () => Promise<void>;
};
export default class AppQueue {
    initQueue(): void;
    attachEvents(): Promise<void>;
    aquire(name: string, _opts?: QueueOptions): Promise<false | IQueueLock>;
    _queueLockReleased(): Promise<void>;
    keepAlive(name: string): Promise<void>;
    _queueAquireLock(name: string, lockId: string): Promise<boolean | undefined>;
    _queueReleaseLock(name: string, lockId: string, startTime: number): Promise<number>;
}
export {};
