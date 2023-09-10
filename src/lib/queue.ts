import { QueueOptions } from "../handlers/BaseHander";
import { AppContext, getContext } from "./context";
import logger from "./logger";

const QUEUE_TIMEOUT = 10;

type IQueueLock = {
  lockId: string;
  startTime: number;
  clear: () => Promise<number>;
  keepAlive: () => Promise<void>;
};
export default class AppQueue {
  initQueue() {
    getContext().events.on("kernel.ready", () => this.attachEvents());
  }
  async attachEvents() {
    logger.byType("queue", `Queue started`);
    await getContext().net.RedisClientSubscriber.subscribe(
      "deba.core.kernel.exlusive.queue",
      (message: string) => {
        logger.byType("queue", `new message`, message);
        this._queueLockReleased();
      },
    );
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
    const qex = await getContext()
      .net.RedisClient.expire(name, QUEUE_TIMEOUT)
      .catch((err) => false);
    console.assert(
      qex,
      "[KernelJs] ~ queue failed to set expire, set to expire",
    );
  }
  async _queueAquireLock(name: string, lockId: string) {
    if (!getContext().ready) {
      logger.byType("queue", `App not ready`);
      return false;
    }
    const result = await getContext()
      .net.RedisClient.setNX(name, lockId)
      .catch((err) => {
        logger.byType("queue", `an error occured`, err);
        return false;
      });
    logger.byType("queue", `aquiring lock ${name} => `, result, lockId);
    if (result) {
      const qex = await getContext()
        .net.RedisClient.expire(name, QUEUE_TIMEOUT)
        .catch((err) => false);
      console.assert(qex, "[KernelJs] ~ queue failed to set expire");
      logger.byType("queue", `lock aquired`, name, lockId);
      getContext().state.count++;
      return true;
    }
    const ttl: number = await getContext()
      .net.RedisClient.ttl(name)
      .catch((err) => -1);
    if (!ttl || ttl < 0) {
      await this.keepAlive(name);
      return false;
    }
  }
  async _queueReleaseLock(name: string, lockId: string, startTime: number) {
    getContext().state.count--;
    if (!Array.isArray(getContext().opts.settings["kernel.exlusive.queue"]))
      getContext().opts.settings["kernel.exlusive.queue"] = [];
    const result = await getContext()
      .net.RedisClient.get(name)
      .catch((err) => false);
    const endTime = Date.now();
    if (result == null || result === false) return endTime - startTime;
    if (result != lockId) {
      logger.byType("queue", `queue lost lock`);
    } else {
      const qdl = await getContext()
        .net.RedisClient.del(name)
        .catch((err) => false);
      console.assert(qdl, "[KernelJs] ~ queue failed to release lock");
    }
    logger.byType("queue", `queue released`, name, lockId);
    await getContext().net.RedisClient.publish(
      "deba.core.kernel.exlusive.queue",
      JSON.stringify({ lockId, name }),
    );
    return endTime - startTime;
  }
}
