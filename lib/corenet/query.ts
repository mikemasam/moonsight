import { Socket } from "socket.io-client";
import { getContext } from "../context";
import CoreNetSelector from "./net";
import NotFound from "../../responders/NotFound";
import {
  makeSocketRequest,
  makeSocketResponse,
  moveSocketToRequestRaw,
} from "../socket/utils";

const reservedEvents = [
  ":api:kernel:connection", //for newly connected remote corenet clients
];
export default class CoreNetQuery {
  private selector: CoreNetSelector;
  private channel: string;
  constructor(selector: CoreNetSelector, channel: string) {
    this.selector = selector;
    this.channel = channel;
  }

  async dpathQuery(dpath: string, body: Object) {
    this.channel = "";
    if (!dpath?.length) return this.query("", body);
    const matched = [
      ...dpath.matchAll(/(dapp:\/\/)([a-z\.]*)([:a-z\.\-\/\[\]]*)/g),
    ][0];
    if (matched.length < 3 || matched[1] != "dapp://")
      return this.query("", body);
    this.channel = matched[2];
    return this.query(matched[3], body);
  }

  async query(event: string, body: Object) {
    if (this.selector.ready === null) {
      return new Promise((resolv) => {
        this.selector.queue.push(() => resolv(this._query(event, body)));
      });
    }
    return this._query(event, body);
  }

  async _query(event: string, body: Object) {
    if (event && reservedEvents.includes(event))
      throw new Error(
        `[KernelJs] ~ CoreNet query for reserved events ${event}`
      );
    if (this.selector.isLocal) {
      return this.__localQuery(event, body);
    } else {
      return this.__remoteQuery(event, body);
    }
  }

  async __remoteQuery(event: string, body: Object) {
    return new Promise(async (resolve, reject) => {
      if (!event || !this.selector.ready || !this.channel) {
        return this.__handleFailed(
          this.selector.socket!,
          event,
          body,
          resolve,
          502
        );
      } else {
        const data = { channel: this.channel, event, body };
        this.selector.socket!.emit(
          this.channel == "core" ? event : "kernel.corenet.channel.transport",
          data,
          (response: any) => {
            resolve(response);
          }
        );
      }
    });
  }
  async __localQuery(event: string, body: Object) {
    return new Promise(async (resolve, reject) => {
      if (!event || !this.selector.ready || !this.channel)
        return this.__handleFailed(null, event, body, resolve, 502);
      const { coreIO } = getContext().net;
      const sockets = await coreIO!.fetchSockets();
      //const data = { channel: this.channel, event, body };
      let consumer = sockets.find(
        (s) => s.handshake.query.channelName == this.channel
      );
      if (!consumer) {
        return this.__handleFailed(null, event, body, resolve, 503);
      } else {
        return consumer.emit(event, body, resolve);
      }
    });
  }

  async __handleFailed(
    socket: Socket | null,
    event: string,
    body: Object,
    fn: (a: unknown) => void,
    status: number = 404
  ) {
    const log = {
      path: "kernel.corenet.channel.transport",
      ctx: getContext(),
      startTime: Date.now(),
    };
    const _socket = moveSocketToRequestRaw(socket!);
    const req = makeSocketRequest(_socket, event, "icore", "icore", body, "");
    const res = makeSocketResponse(fn);
    return NotFound({
      status,
      message: "Service not available at the moment, please try again later.",
    }).json(log, req, res);
  }
}
