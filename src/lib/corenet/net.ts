import CoreNetQuery from "./query";
import { Socket, io } from "socket.io-client";
import logger from "../logger";
import { getContext } from "../context";
import NotFound from "../../responders/NotFound";
import {
  makeSocketRequest,
  makeSocketResponse,
  moveSocketToRequestRaw,
} from "../socket/utils";
import { CoreResponse } from "../../handlers/BaseHander";

export default class CoreNetSelector {
  public socket?: Socket = undefined;
  public ready: boolean | null = null;
  public isLocal: boolean = false;
  public queue: (() => void)[] = [];
  connectRemote() {
    this.ready = false;
    const { events, opts } = getContext();
    getContext().cleanup.add("Remote Core", () => {
      this.socket?.disconnect();
    });
    events.once("kernel.ready", () => {
      logger.kernel(`CoreNet: connecting to ${opts.coreHost as string}...`);
      this.socket = io(opts.coreHost as string, {
        transports: ["websocket"],
        query: {
          channelName: opts.channelName,
        },
      });
      events.emit("kernel.corenet.connection", this.socket);
      this.socket.on("connect", () => this._connected());
      this.socket.on("disconnect", (reason) => this._disconnected(reason));
      this.socket.onAny((...args) => this._handleAll(...args));
    });
    return this;
  }
  connectLocal() {
    this.ready = false;
    const { opts } = getContext();
    getContext().events.once("kernel.ready", () => {
      logger.kernel(`CoreNet: local channel = (${opts.channelName})`);
      this.isLocal = true;
      this.ready = true;
      this.clearQueue();
      getContext().events.emit("kernel.internal.corenet.ready", {});
    });
    return this;
  }
  _handleAll(...args: any[]) {
    const [event, body, fn] = args;
    if (this.socket?.hasListeners(event)) {
      //console.log("event found");
    } else {
      logger.byType("error", "CoreNet: event not found", event);
      const log = {
        path: "corenet.channel.receiver",
        ctx: getContext(),
        startTime: Date.now(),
      };

      const _socket = moveSocketToRequestRaw(this.socket!);
      const ip = getContext().opts.coreHost;
      const req = makeSocketRequest(_socket, event, "icore", "icore", body);
      const res = makeSocketResponse(fn);
      NotFound().json(log, req, res);
    }
  }

  _disconnected(reason: string) {
    this.ready = false;
    logger.kernel(
      `CoreNet: disconnected from ${getContext().opts.coreHost} - ${reason}`
    );
  }
  _connected() {
    this.ready = true;
    logger.kernel(`CoreNet: connected to ${getContext().opts.coreHost}`);
    this.clearQueue();
    getContext().events.emit("kernel.internal.corenet.ready", { ready: true });
  }

  clearQueue() {
    let task = this.queue.pop();
    while (task) {
      task();
      task = this.queue.pop();
    }
  }

  isConnected() {
    return this.socket?.connected;
  }
  select(channel = "core") {
    return new CoreNetQuery(this, channel);
  }
  async query<T>(dpath: string, body: Object): Promise<CoreResponse<T>> {
    return new CoreNetQuery(this, "").selectQuery<T>(dpath, body);
  }
}
