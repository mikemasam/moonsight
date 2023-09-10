import { Namespace, Server, Socket } from "socket.io";
import logger from "../logger";
import EventEmitter from "events";
import { AppContextOpts } from "../context";
import NotFound from "../../responders/NotFound";
import {
  SocketRequest,
  SocketRequestRaw,
  SocketResponse,
} from "../../handlers/BaseHander";
import {
  makeSocketRequest,
  makeSocketResponse,
  moveSocketToRequestRaw,
} from "./utils";

function useAuth(socket: Socket, next: (a?: any) => void) {
  const ctx = global.deba_kernel_ctx;
  const allowedIPs = ctx.opts.mountCore!.allowedIPs;
  const allowed =
    allowedIPs
      .split(",")
      .join("")
      .split(" ")
      .indexOf(socket.handshake.address) > -1;
  if (allowed) {
    logger.byTypes(
      ["core", "info", "kernel", "networking"],
      `CoreNet: added [${socket.handshake.query.channelName} - ${socket.handshake.address}].`,
    );
    next();
  } else {
    logger.byTypes(
      ["core", "info", "kernel", "networking"],
      `CoreNet: rejected [${socket.handshake.query.channelName} - ${socket.handshake.address}].`,
    );
    next(new Error("invalid"));
  }
}

type TransportData = {
  body: any;
  event: string;
  channel: string;
};

function useCorenetChannelTransport(socket: SocketRequestRaw) {
  return (data: TransportData, fn: () => void) => {
    const { channel, body, event } = data;
    const ctx = global.deba_kernel_ctx;
    if (ctx.net.coreIO == null) {
      logger.byTypes(
        ["kernel", "error", "networking", "exception"],
        "ChannelTransport - Corenet not intialized",
      );
      return;
    }
    ctx.net.coreIO.fetchSockets().then((sockets) => {
      let consumer = sockets.find(
        (s) => s.handshake.query.channelName == channel,
      );
      if (!consumer) {
        const log = {
          path: "corenet.channel.transport",
          ctx,
          startTime: Date.now(),
        };
        const req = makeSocketRequest(socket, event, "icore", "icore", body);
        const res: SocketResponse = makeSocketResponse(fn);
        logger.byTypes(
          ["error", "networking", "corenet"],
          "passthrough event failed, channel offline, event:",
          event,
          ", channel:",
          channel,
        );
        NotFound({
          status: 503,
          message:
            "Service not available at the moment, please try again later.",
        })
          .json(log, req, res)
          .socket();
      } else {
        logger.byTypes(
          ["error", "networking", "corenet"],
          "passthrough event:",
          event,
          ", channel:",
          channel,
        );
        consumer.emit(event, body, fn);
      }
    });
  };
}

function useAnyEvent(socket: SocketRequestRaw) {
  return (event: string, ...args: any[]) => {
    const ctx = global.deba_kernel_ctx;
    const count = socket.listenerCount(event);
    if (count < 1) {
      logger.byTypes(
        ["error", "networking", "corenet"],
        "local corenet event not found: unhandled, event:",
        event,
      );
      const log = {
        path: "corenet.channel.transport",
        ctx,
        startTime: Date.now(),
      };
      const [body, fn] = args;
      const req = makeSocketRequest(socket, event, "icore", "icore", body);
      const res: SocketResponse = makeSocketResponse(fn);
      NotFound().json(log, req, res).socket();
    } else {
      logger.byTypes(
        ["corenet", "networking"],
        "local corenet event handled,  event:",
        event,
      );
    }
  };
}

export default async function CoreSocket(
  io: Server,
  events: EventEmitter,
  opts: AppContextOpts,
) {
  io.setMaxListeners(opts.maxListeners || 20);
  const coreApi: Namespace = io.of("/");
  events.on("kernel.ready", () => {
    logger.byTypes(
      ["core", "kernel", "networking"],
      `CoreNet: accepting [IP's Allowed ${opts.mountCore?.allowedIPs}].`,
    );
    coreApi.use(useAuth);
    coreApi.on("connection", (socket) => {
      broadcastCoreState(events, coreApi, "connection", socket);
      socket.on("disconnect", () => {
        broadcastCoreState(events, coreApi, "disconnect", socket);
      });
      socket.on(
        "kernel.corenet.channel.transport",
        useCorenetChannelTransport(moveSocketToRequestRaw(socket)!),
      );
      socket.onAny(useAnyEvent(moveSocketToRequestRaw(socket)!));
    });
  });

  return coreApi;
}

const broadcastCoreState = async (
  events: EventEmitter,
  coreApi: Namespace,
  state: string,
  socket: Socket,
) => {
  const channel = {
    name: socket.handshake.query.channelName,
    ip: socket.handshake.address,
    id: socket.id,
  };
  const sockets = await coreApi.fetchSockets();
  let channels = sockets.map((s) => ({
    name: s.handshake.query.channelName,
    ip: s.handshake.address,
    id: s.id,
  }));
  //notify remote cores for new connections
  coreApi.emit(":api:kernel:connection", { channels, channel, state });
  //notify local core for new connections
  events.emit("kernel.connection", { channels, channel, state });
};
