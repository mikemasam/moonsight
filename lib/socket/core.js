
export default async function CoreSocket(ctx, io){
  const coreIO = io.of("/core");
  const { allowedIPs } = ctx.opts.mountCore;
  console.log("[KernelJs] ~ CoreNet: host started.");
  coreIO.use((socket, next) => {
    if(allowedIPs.split(',').join('').split(' ').indexOf(socket.handshake.address) > -1){
      console.log(`[KernelJs] ~ CoreNet: consumer added ${socket.handshake.query.channelName}.`);
      next();
    }else{
      next(new Error("invalid"));
    }
  });
  coreIO.on("connection", socket => {
    socket.on("kernel.corenet.channel.join", (name, fn) => {
      socket.join(name);
      fn(1);
    });
    socket.on('kernel.corenet.channel.transport', (data, fn) => {
      const { channel, body, event } = data;
      coreIO.fetchSockets().then(sockets => {
        let consumer = sockets.find(s => s.handshake.query.channelName == channel);
        consumer.emit(event, body, fn);
      });
    });
  })
  return coreIO;
}


