"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
    attachEvents() {
        return __awaiter(this, void 0, void 0, function* () {
            logger_1.default.byType("queue", `Queue started`);
            yield (0, context_1.getContext)().net.RedisClientSubscriber.subscribe("deba.core.kernel.exlusive.queue", (message) => {
                logger_1.default.byType("queue", `new message`, message);
                this._queueLockReleased();
            });
        });
    }
    aquire(name, _opts) {
        return __awaiter(this, void 0, void 0, function* () {
            const opts = { wait: true };
            if (_opts === true)
                opts.wait = true;
            else if (_opts === false)
                opts.wait = false;
            else if ((_opts === null || _opts === void 0 ? void 0 : _opts.wait) === false)
                opts.wait = false;
            if (!Array.isArray((0, context_1.getContext)().opts.settings["kernel.exlusive.queue"]))
                (0, context_1.getContext)().opts.settings["kernel.exlusive.queue"] = [];
            return new Promise((resolve) => __awaiter(this, void 0, void 0, function* () {
                const lockId = Math.random() + "";
                const startTime = Date.now();
                const aquired = yield this._queueAquireLock(name, lockId);
                if (aquired) {
                    resolve({
                        lockId,
                        startTime,
                        clear: () => __awaiter(this, void 0, void 0, function* () { return this._queueReleaseLock(name, lockId, startTime); }),
                        keepAlive: () => __awaiter(this, void 0, void 0, function* () { return this.keepAlive(name); }),
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
            }));
        });
    }
    _queueLockReleased() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!Array.isArray((0, context_1.getContext)().opts.settings["kernel.exlusive.queue"]))
                (0, context_1.getContext)().opts.settings["kernel.exlusive.queue"] = [];
            const task = (0, context_1.getContext)().opts.settings[`kernel.exlusive.queue`][0];
            if (task) {
                const aquired = yield this._queueAquireLock(task.name, task.lockId);
                if (aquired) {
                    (0, context_1.getContext)().opts.settings[`kernel.exlusive.queue`].splice(0, 1);
                    task.resolve({
                        lockId: task.lockId,
                        clear: () => __awaiter(this, void 0, void 0, function* () { return this._queueReleaseLock(task.name, task.lockId, task.startTime); }),
                        keepAlive: () => __awaiter(this, void 0, void 0, function* () { return this.keepAlive(task.name); }),
                    });
                }
            }
        });
    }
    keepAlive(name) {
        return __awaiter(this, void 0, void 0, function* () {
            const qex = yield (0, context_1.getContext)()
                .net.RedisClient.expire(name, QUEUE_TIMEOUT)
                .catch((err) => false);
            console.assert(qex, "[KernelJs] ~ queue failed to set expire, set to expire");
        });
    }
    _queueAquireLock(name, lockId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, context_1.getContext)().ready) {
                logger_1.default.byType("queue", `App not ready`);
                return false;
            }
            const result = yield (0, context_1.getContext)()
                .net.RedisClient.setNX(name, lockId)
                .catch((err) => {
                logger_1.default.byType("queue", `an error occured`, err);
                return false;
            });
            logger_1.default.byType("queue", `aquiring lock ${name} => `, result, lockId);
            if (result) {
                const qex = yield (0, context_1.getContext)()
                    .net.RedisClient.expire(name, QUEUE_TIMEOUT)
                    .catch((err) => false);
                console.assert(qex, "[KernelJs] ~ queue failed to set expire");
                logger_1.default.byType("queue", `lock aquired`, name, lockId);
                (0, context_1.getContext)().state.count++;
                return true;
            }
            const ttl = yield (0, context_1.getContext)()
                .net.RedisClient.ttl(name)
                .catch((err) => -1);
            if (!ttl || ttl < 0) {
                yield this.keepAlive(name);
                return false;
            }
        });
    }
    _queueReleaseLock(name, lockId, startTime) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, context_1.getContext)().state.count--;
            if (!Array.isArray((0, context_1.getContext)().opts.settings["kernel.exlusive.queue"]))
                (0, context_1.getContext)().opts.settings["kernel.exlusive.queue"] = [];
            const result = yield (0, context_1.getContext)()
                .net.RedisClient.get(name)
                .catch((err) => false);
            const endTime = Date.now();
            if (result == null || result === false)
                return endTime - startTime;
            if (result != lockId) {
                logger_1.default.byType("queue", `queue lost lock`);
            }
            else {
                const qdl = yield (0, context_1.getContext)()
                    .net.RedisClient.del(name)
                    .catch((err) => false);
                console.assert(qdl, "[KernelJs] ~ queue failed to release lock");
            }
            logger_1.default.byType("queue", `queue released`, name, lockId);
            yield (0, context_1.getContext)().net.RedisClient.publish("deba.core.kernel.exlusive.queue", JSON.stringify({ lockId, name }));
            return endTime - startTime;
        });
    }
}
exports.default = AppQueue;
