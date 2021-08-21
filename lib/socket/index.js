import { Server } from 'socket.io';
import CoreIO from './core.js';

export default async function SocketApp(context){
  const { httpServer } = context.net;
  const { opts } = context;
  const IOs = {};

  IOs.socketIO = new Server(httpServer, { 
    cors: { origin: "*" },
    //transports: ["websocket"],
    allowEIO3: true
  });
  if(opts.mountCore){
    IOs.coreIO =  await CoreIO(context, IOs.socketIO);
  }

  return {
    ...context,
    net: {
      ...context.net,
      ...IOs
    }
  }
}
