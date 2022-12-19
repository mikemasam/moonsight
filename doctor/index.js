import HttpDoctor from './http.js';
import SocketDoctor, 
{ initSocket, cleanSocket } from './socket.js';
export default async function doctor(opts){
  if(opts.socket) await initSocket(opts);
  return {
    opts,
    host: opts.host,
    socket: () => SocketDoctor(),
    http: () => HttpDoctor(opts),
    cleanup: () => {
      cleanSocket();
    }
  }
}
