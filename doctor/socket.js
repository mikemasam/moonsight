import { io } from "socket.io-client";
let socket = null;


export const cleanSocket = () => {
  socket?.disconnect();
}
export const initSocket = async (opts) => {
  return new Promise(reslv => {
    socket = io(`http://${opts.host}`, { transports: ["websocket"], query: opts.socket?.query });
    socket.on('connect', () => reslv(socket));
    socket.on("disconnect", (message) => reslv(null));
    socket.on("error", (err) => reslv(null));
    socket.on("connect_error", (err) => reslv(null));
    socket.emitAsync = emitAsync;
  });
}
export default function creator(){
  return socket;
}

const emitAsync = async (path, value) => {
  return new Promise(reslv => {
    socket.emit(path, value, response => {
      reslv(response);
    })
  });
}
