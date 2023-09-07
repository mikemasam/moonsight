import { Namespace, Server } from "socket.io";
import CoreIO from "./core";
import SocketIO from "./client";
import http from "http";
import { AppContextOpts } from "../context";
import EventEmitter from "events";

export async function createCoreIOServer(
  coreServer: http.Server,
  opts: AppContextOpts,
  events: EventEmitter
): Promise<Namespace | null> {
  if (opts.mountCore?.mount) {
    const coreIO: Server = new Server(coreServer, {
      cors: { origin: "*" },
      transports: ["websocket"],
      allowEIO3: true,
    });
    return CoreIO(coreIO, events, opts);
  }
  return null;
}

export async function createSocketIOServer(
  httpServer: http.Server,
  opts: AppContextOpts,
  events: EventEmitter
): Promise<Namespace> {
  const io: Server = new Server(httpServer, {
    cors: { origin: "*" },
    transports: ["websocket"],
    allowEIO3: true,
  });
  return SocketIO(io, events, opts);
}
