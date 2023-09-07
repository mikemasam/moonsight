import EventEmitter from "events";
import logger from "./logger";
import { getContext } from "./context";

const events = new EventEmitter();
export default events;
export async function SystemEvents() {
  getContext().events.setMaxListeners(getContext().opts.maxListeners || 20);
  const heartbeat = setInterval(() => {
    getContext().events.emit("kernel.internal.heartbeat", {});
    if (getContext().ready) getContext().events.emit("kernel.heartbeat", {});
  }, 1000);
  getContext().events.on("kernel.ready", (fromW) => {
    getContext().state.timeout = getContext().opts.shutdownTimeout;
    if (getContext().ready === undefined) getContext().ready = true;
    //else isAliveCheck();
  });
  const testReady = () => {
    if (!getContext().state.redisReady) return;
    if (!getContext().state.httpReady) return;
    if (getContext().ready === undefined)
      getContext().events.emit("kernel.ready", "form test");
  };
  getContext().events.on("kernel.internal.redis.ready", () => {
    getContext().state.redisReady = true;
    getContext().events.emit("kernel.redis.ready");
    testReady();
  });
  getContext().events.on("kernel.internal.http.ready", () => {
    getContext().state.httpReady = true;
    getContext().events.emit("kernel.http.ready");
    testReady();
  });
  getContext().events.on("kernel.internal.corenet.ready", () => {
    getContext().state.corenetReady = true;
    getContext().events.emit("kernel.corenet.ready");
  });
  //TODO: enable state count
  const isAliveCheck = () => {
    //logger.byType("state", `State Count: ${getContext().state.count}`);
    if (
      getContext().state.shutdown &&
      (getContext().state.count <= 0 || getContext().state.timeout <= 0)
    ) {
      logger.kernel("-_-");
      if (!process.env.JEST_WORKER_ID) process.exit(0);
    } else if (getContext().state.shutdown) {
      getContext().state.timeout--;
    }
  };
  getContext().events.on("kernel.internal.heartbeat", () => {
    isAliveCheck();
  });

  ["SIGINT", "SIGTERM"].forEach((evt) =>
    process.on(evt, () => {
      if (getContext().ready) logger.kernel("waiting for services....");
      if (getContext().ready) getContext().cleanup.dispose();
      getContext().ready = false;
      getContext().state.shutdown = true;
      isAliveCheck();
    })
  );
  getContext().cleanup.add("Events", () => {
    getContext().ready = false;
    getContext().state.shutdown = true;
    clearInterval(heartbeat);
  });
}
