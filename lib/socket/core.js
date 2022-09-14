import { NotFound } from '../../responders/index.js';

export default async function CoreSocket(ctx, io){
  const { opts } = ctx;
  io.setMaxListeners(opts.maxListeners || 20);
  const coreIO = io.of("/");
  const { allowedIPs } = opts.mountCore;


  ctx.events.on("kernel.ready", () => {
    console.log(`[KernelJs] ~ CoreNet: accepting [IP's Allowed ${allowedIPs}].`);
    coreIO.use((socket, next) => {
      if(allowedIPs.split(',').join('').split(' ').indexOf(socket.handshake.address) > -1){
        if(opts.logging.core)
          console.log(`[KernelJs] ~ CoreNet: added [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
        next();
      }else{
        if(opts.logging.core)
          console.log(`[KernelJs] ~ CoreNet: rejected [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
        next(new Error("invalid"));
      }
    });

    coreIO.on("connection", socket => {
      broadcastCoreState(ctx, coreIO, 'connection', socket);
      socket.on('disconnect', () => {
        broadcastCoreState(ctx, coreIO, 'disconnect', socket);
      });
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
            NotFound({ status: 503, message: 'Service not available at the moment, please try again later.' })(log, req, res);
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
    });
  });

  return coreIO;
}

const broadcastCoreState = async (ctx, coreIO, state, socket) => {
  const channel = {
    name: socket.handshake.query.channelName,
    ip: socket.handshake.address,
    id: socket.id
  }
  const sockets = await coreIO.fetchSockets();
  let channels = sockets.map(s => ({
    name: s.handshake.query.channelName,
    ip: s.handshake.address,
    id: s.id
  }));
  //notify remote cores for new connections
  coreIO.emit(":api:kernel:connection", { channels, channel, state });
  //notify local core for new connections
  ctx.events.emit("kernel.connection", { channels, channel, state });
}


