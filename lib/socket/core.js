import { NotFound } from '../../responders/index.js';

export default async function CoreSocket(ctx, io){
  const { opts } = ctx;
  const coreIO = io.of("/core");
  const { allowedIPs } = opts.mountCore;
  console.log(`[KernelJs] ~ CoreNet: host started [IP's Allowed ${allowedIPs}].`);
  coreIO.use((socket, next) => {
    if(allowedIPs.split(',').join('').split(' ').indexOf(socket.handshake.address) > -1){
      if(opts.logging.core)
        console.log(`[KernelJs] ~ CoreNet: consumer added [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
      next();
    }else{
      if(opts.logging.core)
        console.log(`[KernelJs] ~ CoreNet: consumer rejected [${socket.handshake.query.channelName} - ${socket.handshake.address}].`);
      next(new Error("invalid"));
    }
  });

  coreIO.on("connection", socket => {
    connectionReceived(ctx, socket);
    const channelName = socket.handshake.query.channelName;
    broadcastCoreState(coreIO, 'connection', channelName);
    socket.on('disconnect', () => {
      broadcastCoreState(coreIO, 'disconnect', channelName);
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

  return coreIO;
}

const connectionReceived = (ctx, socket) => {
  const { events, opts } = ctx;
  //console.log(opts);
  const channelName = socket.handshake.query.channelName;
  //events.emit('kernel.core.connection', { socket, channelName });
}


const broadcastCoreState = (coreIO, type = 'connection', channel) => {
  coreIO.fetchSockets().then(sockets => {
    let channels = sockets.map(s => ({
      name: s.handshake.query.channelName,
      ip: s.handshake.address
    }));
    //console.log(channels);
    coreIO.emit(":api:kernel:connection", { body: { channels, channel } });
  });
}


