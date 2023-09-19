"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const context_1 = require("./context");
const logger_1 = __importDefault(require("./logger"));
const QUEUE_TIMEOUT = 10;
class AppQueue {
    initQueue() {
        (0, context_1.getContext)().events.on("kernel.ready", () => this.attachEvents());
    }
    async attachEvents() {
        logger_1.default.byType("queue", `Queue started`);
        await (0, context_1.getContext)().net.RedisClientSubscriber.subscribe("deba.core.kernel.exlusive.queue", (message) => {
            logger_1.default.byType("queue", `new message`, message);
            this._queueLockReleased();
        });
    }
    async aquire(name, _opts) {
        const opts = Object.assign({ wait: true }, _opts);
        if (!Array.isArray((0, context_1.getContext)().opts.settings["kernel.exlusive.queue"]))
            (0, context_1.getContext)().opts.settings["kernel.exlusive.queue"] = [];
        return new Promise(async (resolve) => {
            const lockId = Math.random() + "";
            const startTime = Date.now();
            const aquired = await this._queueAquireLock(name, lockId);
            if (aquired) {
                resolve({
                    lockId,
                    startTime,
                    clear: async () => this._queueReleaseLock(name, lockId, startTime),
                    keepAlive: async () => this.keepAlive(name),
                });
            }
            else {
                if (opts.wait) {
                    (0, context_1.getContext)().opts.settings[`kernel.exlusive.queue`].push({
                        lockId,
                        resolve,
                        name,
                    });
                }
                else {
                    resolve(false);
                }
            }
        });
    }
    async _queueLockReleased() {
        if (!Array.isArray((0, context_1.getContext)().opts.settings["kernel.exlusive.queue"]))
            (0, context_1.getContext)().opts.settings["kernel.exlusive.queue"] = [];
        const task = (0, context_1.getContext)().opts.settings[`kernel.exlusive.queue`][0];
        if (task) {
            const aquired = await this._queueAquireLock(task.name, task.lockId);
            if (aquired) {
                (0, context_1.getContext)().opts.settings[`kernel.exlusive.queue`].splice(0, 1);
                task.resolve({
                    lockId: task.lockId,
                    clear: async () => this._queueReleaseLock(task.name, task.lockId, task.startTime),
                    keepAlive: async () => this.keepAlive(task.name),
                });
            }
        }
    }
    async keepAlive(name) {
        const qex = await (0, context_1.getContext)()
            .net.RedisClient.expire(name, QUEUE_TIMEOUT)
            .catch((err) => false);
        console.assert(qex, "[KernelJs] ~ queue failed to set expire, set to expire");
    }
    async _queueAquireLock(name, lockId) {
        if (!(0, context_1.getContext)().ready) {
            logger_1.default.byType("queue", `App not ready`);
            return false;
        }
        const result = await (0, context_1.getContext)()
            .net.RedisClient.setNX(name, lockId)
            .catch((err) => {
            logger_1.default.byType("queue", `an error occured`, err);
            return false;
        });
        logger_1.default.byType("queue", `aquiring lock ${name} => `, result, lockId);
        if (result) {
            const qex = await (0, context_1.getContext)()
                .net.RedisClient.expire(name, QUEUE_TIMEOUT)
                .catch((err) => false);
            console.assert(qex, "[KernelJs] ~ queue failed to set expire");
            logger_1.default.byType("queue", `lock aquired`, name, lockId);
            (0, context_1.getContext)().state.count++;
            return true;
        }
        const ttl = await (0, context_1.getContext)()
            .net.RedisClient.ttl(name)
            .catch((err) => -1);
        if (!ttl || ttl < 0) {
            await this.keepAlive(name);
            return false;
        }
    }
    async _queueReleaseLock(name, lockId, startTime) {
        (0, context_1.getContext)().state.count--;
        if (!Array.isArray((0, context_1.getContext)().opts.settings["kernel.exlusive.queue"]))
            (0, context_1.getContext)().opts.settings["kernel.exlusive.queue"] = [];
        const result = await (0, context_1.getContext)()
            .net.RedisClient.get(name)
            .catch((err) => false);
        const endTime = Date.now();
        if (result == null || result === false)
            return endTime - startTime;
        if (result != lockId) {
            logger_1.default.byType("queue", `queue lost lock`);
        }
        else {
            const qdl = await (0, context_1.getContext)()
                .net.RedisClient.del(name)
                .catch((err) => false);
            console.assert(qdl, "[KernelJs] ~ queue failed to release lock");
        }
        logger_1.default.byType("queue", `queue released`, name, lockId);
        await (0, context_1.getContext)().net.RedisClient.publish("deba.core.kernel.exlusive.queue", JSON.stringify({ lockId, name }));
        return endTime - startTime;
    }
}
exports.default = AppQueue;
