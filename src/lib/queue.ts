import { QueueOptions } from "../handlers/BaseHander";
import { AppContext, getContext } from "./context";
import events from "./events";
import logger from "./logger";
import { getRedisClient, getRedisClientSubscriber } from "./redis";

const QUEUE_TIMEOUT = 10;

type IQueueLock = {
  lockId: string;
  startTime: number;
  clear: () => Promise<number>;
  keepAlive: () => Promise<void>;
};
export default class AppQueue {
  initialized = false;
  isLocal = false;
  local: {
    startTime: number;
    name: string;
    lockId: string;
    timeout: number;
    clear_timeout: number;
  }[] = [];
  initQueue() {
    getContext().events.on("kernel.ready", () => this.attachEvents());
  }
  async attachEvents() {
    logger.byType("queue", `Queue started`);
    this.isLocal = !getContext().net.RedisClientSubscriber;
    this.initialized = true;
    if (!this.isLocal) {
      await getRedisClientSubscriber().subscribe(
        "deba.core.kernel.exlusive.queue",
        (message: string) => {
          logger.byType("queue", `new message`, message);
          this._queueLockReleased();
        },
      );
    }else{
      events.on("deba.core.kernel.exlusive.queue", (message) => {
          logger.byType("queue", `new message`, message);
          this._queueLockReleased();
      })
    }
  }
  async aquire(
    name: string,
    _opts?: QueueOptions,
  ): Promise<false | IQueueLock> {
    const opts: QueueOptions = { wait: true, ..._opts };
    if (!Array.isArray(getContext().opts.settings["kernel.exlusive.queue"]))
      getContext().opts.settings["kernel.exlusive.queue"] = [];
    return new Promise(async (resolve) => {
      const lockId: string = Math.random() + "";
      const startTime = Date.now();
      const aquired = await this._queueAquireLock(name, lockId);
      if (aquired) {
        resolve({
          lockId,
          startTime,
          clear: async () => this._queueReleaseLock(name, lockId, startTime),
          keepAlive: async () => this.keepAlive(name),
        });
      } else {
        if (opts.wait) {
          getContext().opts.settings[`kernel.exlusive.queue`].push({
            lockId,
            resolve,
            name,
          });
        } else {
          resolve(false);
        }
      }
    });
  }
  async _queueLockReleased() {
    if (!Array.isArray(getContext().opts.settings["kernel.exlusive.queue"]))
      getContext().opts.settings["kernel.exlusive.queue"] = [];
    const task = getContext().opts.settings[`kernel.exlusive.queue`][0];
    if (task) {
      const aquired = await this._queueAquireLock(task.name, task.lockId);
      if (aquired) {
        getContext().opts.settings[`kernel.exlusive.queue`].splice(0, 1);
        task.resolve({
          lockId: task.lockId,
          clear: async () =>
            this._queueReleaseLock(task.name, task.lockId, task.startTime),
          keepAlive: async () => this.keepAlive(task.name),
        });
      }
    }
  }
  async keepAlive(name: string) {
    if (!this.initialized) return;
    if (!this.isLocal) {
      const pos = this.local.findIndex((r) => r.name == name);
      if (pos > -1) {
        this.local[pos].timeout = Date.now() + QUEUE_TIMEOUT * 1000;
        this.local[pos].clear_timeout = Date.now() + QUEUE_TIMEOUT * 10 * 1000;
      }
      return;
    }
    const qex = await getRedisClient()
      .expire(name, QUEUE_TIMEOUT)
      .catch((_) => false);
    console.assert(
      qex,
      "[KernelJs] ~ queue failed to set expire, set to expire",
    );
    return;
  }
  clearExpiredLocal() {
    const currentTime = Date.now();
    this.local = this.local.filter((l) => l.clear_timeout > currentTime);
  }
  async _queueAquireLock(name: string, lockId: string) {
    if (!this.initialized) {
      logger.byType("queue", `App not ready`);
      return false;
    }

    if (this.isLocal) {
      this.clearExpiredLocal();
      const found = this.local.find((n) => n.name == name);
      if (found) return false;
      this.local.push({
        startTime: Date.now(),
        name,
        lockId,
        timeout: Date.now() + QUEUE_TIMEOUT * 1000,
        clear_timeout: Date.now() + QUEUE_TIMEOUT * 10 * 1000,
      });
      return true;
    }
    const result = await getRedisClient()
      .setNX(name, lockId)
      .catch((err) => {
        logger.byType("queue", `an error occured`, err);
        return false;
      });
    logger.byType("queue", `aquiring lock ${name} => `, result, lockId);
    if (result) {
      const qex = await getRedisClient()
        .expire(name, QUEUE_TIMEOUT)
        .catch((err) => false);
      console.assert(qex, "[KernelJs] ~ queue failed to set expire");
      logger.byType("queue", `lock aquired`, name, lockId);
      getContext().state.count++;
      return true;
    }
    const ttl: number = await getRedisClient()
      .ttl(name)
      .catch((err) => -1);
    if (!ttl || ttl < 0) {
      await this.keepAlive(name);
      return false;
    }
  }
  async _queueReleaseLock(name: string, lockId: string, startTime: number) {
    if (!this.initialized) {
      return 0;
    }
    getContext().state.count--;

    const endTime = Date.now();
    if (this.isLocal) {
      const pos = this.local.findIndex((r) => r.name == name);
      let timelap = -1;
      if(pos > -1){
        const startTime = this.local[pos].startTime;
        this.local.splice(pos, 1);
        timelap = endTime - startTime;
      }
      this.clearExpiredLocal();
      logger.byType("queue", `local: queue released`, name, lockId);
      events.emit(
        "deba.core.kernel.exlusive.queue",
        JSON.stringify({ lockId, name }),
      );
      return timelap;
    }

    if (!Array.isArray(getContext().opts.settings["kernel.exlusive.queue"]))
      getContext().opts.settings["kernel.exlusive.queue"] = [];
    const result = await getRedisClient()
      .get(name)
      .catch((err) => false);
    if (result == null || result === false) return endTime - startTime;
    if (result != lockId) {
      logger.byType("queue", `queue lost lock`);
    } else {
      const qdl = await getRedisClient()
        .del(name)
        .catch((err) => false);
      console.assert(qdl, "[KernelJs] ~ queue failed to release lock");
    }
    logger.byType("queue", `remote: queue released`, name, lockId);
    await getRedisClient().publish(
      "deba.core.kernel.exlusive.queue",
      JSON.stringify({ lockId, name }),
    );
    return endTime - startTime;
  }
}
