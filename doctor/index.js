import HttpDoctor from './http.js';
import SocketDoctor, 
{ initSocket, cleanSocket } from './socket.js';
export default async function doctor(opts){
  if(process.env.APP_ENV != 'development'){
    throw `Expected APP_ENV == development, Found APP_ENV == ${process.env.APP_ENV}`;
  }
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
