
export default async function ClientSocket(ctx, io){
  const { opts } = ctx;
  io.setMaxListeners(opts.maxListeners || 20);
  const clientIO = io.of("/");
  clientIO.use((socket, next) => {
    if(opts.logging.socket)
      console.log(`[KernelJs] ~ SocketIO: consumer added [${socket.handshake.address}].`);
    next();
  });

  return clientIO;
}
