import { Socket } from "socket.io-client";
import { getContext } from "../context";
import CoreNetSelector from "./net";
import NotFound from "../../responders/NotFound";
import {
  makeSocketRequest,
  makeSocketResponse,
  moveSocketToRequestRaw,
} from "../socket/utils";
import { CoreResponse } from "../../handlers/BaseHander";
import logger from "../logger";

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

  async selectQuery<T>(dpath: string, body: Object): Promise<CoreResponse<T>> {
    this.channel = "";
    if (!dpath?.length) return this.query<T>("", body);
    const matchs: any = dpath.matchAll(/(dapp:\/\/)([a-z\.]*)([:a-z\.\-\/\[\]]*)/g);
    const matched = [...matchs][0];
    if (matched.length < 3 || matched[1] != "dapp://")
      return this.query<T>("", body);
    this.channel = matched[2];
    return this.query<T>(matched[3], body);
  }

  async query<T>(event: string, body: Object): Promise<CoreResponse<T>> {
    if (this.selector.ready === null) {
      logger.byType("corenet", "corenet not ready, action added to queue");
      return new Promise((resolv) => {
        this.selector.queue.push(() => resolv(this._query<T>(event, body)));
      });
    }
    return this._query<T>(event, body);
  }

  private async _query<T>(
    event: string,
    body: Object,
  ): Promise<CoreResponse<T>> {
    if (event && reservedEvents.includes(event))
      throw new Error(
        `[KernelJs] ~ CoreNet query for reserved events ${event}`,
      );
    if (this.selector.isLocal) {
      logger.byType("corenet", "using local corenet");
      return this.__localQuery(event, body);
    } else {
      logger.byType("corenet", "using remote corenet");
      return this.__remoteQuery(event, body);
    }
  }

  private async __remoteQuery<T>(
    event: string,
    body: Object,
  ): Promise<CoreResponse<T>> {
    return new Promise(async (resolve, reject) => {
      if (!event || !this.selector.ready || !this.channel) {
        return this.__handleFailed(
          this.selector.socket!,
          event,
          body,
          resolve,
          502,
        );
      } else {
        const data = { channel: this.channel, event, body };
        this.selector.socket!.emit(
          this.channel == "core" ? event : "kernel.corenet.channel.transport",
          data,
          (response: any) => {
            resolve(response);
          },
        );
      }
    });
  }
  private async __localQuery<T>(
    event: string,
    body: Object,
  ): Promise<CoreResponse<T>> {
    return new Promise(async (resolve, reject) => {
      if (!event || !this.selector.ready || !this.channel) {
        logger.byType("corenet", "invalid query params");
        return this.__handleFailed(null, event, body, resolve, 502);
      }
      const { coreIO } = getContext().net;
      if(!coreIO){
        logger.byType("corenet", "invalid state, coreIO not initialized");
        return this.__handleFailed(null, event, body, resolve, 502);
      }
      const sockets = await coreIO!.fetchSockets();
      //const data = { channel: this.channel, event, body };
      let consumer = sockets.find(
        (s) => s.handshake.query.channelName == this.channel,
      );
      if (!consumer) {
        return this.__handleFailed(null, event, body, resolve, 503);
      } else {
        logger.byType(
          "corenet",
          "event send: ",
          event,
          ", to channel: ",
          this.channel,
        );
        return consumer.emit(event, body, (args: any) => {
          logger.byType(
            "corenet",
            "event ack: ",
            event,
            ", from channel: ",
            this.channel,
          );
          return resolve(args);
        });
      }
    });
  }

  private async __handleFailed<T>(
    socket: Socket | null,
    event: string,
    body: Object,
    fn: (a: CoreResponse<T>) => void,
    status: number = 404,
  ) {
    const log = {
      path: "kernel.corenet.channel.transport",
      ctx: getContext(),
      startTime: Date.now(),
    };
    const _socket = moveSocketToRequestRaw(socket);
    const req = makeSocketRequest(_socket, event, "icore", "icore", body, "");
    const res = makeSocketResponse(fn);
    return NotFound({
      status,
      message: "Service not available at the moment, please try again later.",
    })
      .json(log, req, res)
      .socket();
  }
}
