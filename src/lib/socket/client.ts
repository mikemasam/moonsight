import EventEmitter from "events";
import { Namespace, Server } from "socket.io";
import { AppContextOpts } from "../context";
import logger from "../logger";

export default async function ClientSocket(
  io: Server,
  events: EventEmitter,
  opts: AppContextOpts
) {
  io.setMaxListeners(opts.maxListeners || 20);
  const clientIO = io.of("/");
  clientIO.use((socket, next) => {
    logger.byType(
      "socket",
      `[KernelJs] ~ SocketIO: consumer added [${socket.handshake.address}].`
    );
    next();
  });

  return clientIO;
}
