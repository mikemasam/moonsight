import { NotFound } from '../../responders/index.js';

export default async function CoreSocket(ctx, io){
  const coreIO = io.of("/core");
  const { allowedIPs } = ctx.opts.mountCore;
  console.log("[KernelJs] ~ CoreNet: host started.");
  coreIO.use((socket, next) => {
    if(allowedIPs.split(',').join('').split(' ').indexOf(socket.handshake.address) > -1){
      console.log(`[KernelJs] ~ CoreNet: consumer added [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
      next();
    }else{
      console.log(`[KernelJs] ~ CoreNet: consumer rejected [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
      next(new Error("invalid"));
    }
  });
  coreIO.on("connection", socket => {
    socket.on('kernel.corenet.channel.transport', (data, fn) => {
      const { channel, body, event } = data;
      coreIO.fetchSockets().then(sockets => {
        let consumer = sockets.find(s => s.handshake.query.channelName == channel);
        if(!consumer?.connected){
          const log = {
            path: 'corenet.channel.transport',
            ctx,
            startTime: Date.now(),
          };
          const ip = socket?.handshake?.address;
          const req = { method: 'icore', socket, body, originalUrl: event, ip }
          const res = { fn };
          NotFound({ message: 'Service not available at the moment, please try again later.' })(log, req, res);
        }else{
          consumer.emit(event, body, fn);
        }
      });
    });

    socket.onAny((event, ...args) => {
      if(socket.listenerCount(event) < 1){
        const log = {
          path: 'corenet.channel.transport',
          ctx,
          startTime: Date.now(),
        };
        const [body, fn] = args;
        const ip = socket?.handshake?.address;
        const req = { method: 'icore', socket, body, originalUrl: event, ip }
        const res = { fn };
        NotFound()(log, req, res);
      }
    });


  })
  return coreIO;
}


