import { Server } from 'socket.io';
import CoreIO from './core.js';
import SocketIO from './client.js';

export default async function SocketApp(context){
  const { httpServer, coreServer } = context.net;
  const { opts } = context;
  const io = new Server(httpServer, { 
    cors: { origin: "*" },
    transports: ["websocket"],
    allowEIO3: true
  });
  const IOs = {};
  IOs.socketIO = await SocketIO(context, io);
  if(opts.mountCore.mount){
    const coreIO = new Server(coreServer, { 
      cors: { origin: "*" },
      transports: ["websocket"],
      allowEIO3: true
    });
    IOs.coreIO = await CoreIO(context, coreIO);
  }

  context.net = {
      ...context.net,
      ...IOs
  }
  return context;
}
