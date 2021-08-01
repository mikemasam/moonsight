import { Server } from 'socket.io';

export default async function SocketApp(context){
  const { httpServer } = context.net;
  const io = new Server(httpServer);
  return {
    ...context,
    net: {
      ...context.net,
      io 
    }
  }
}
