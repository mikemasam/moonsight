import { io } from "socket.io-client";
let socket = null;
export default async function creator(kernel, query){
  return new Promise(reslv => {
    if(!socket){
      socket = io(`http://${kernel.opts.host}`, { transports: ["websocket"], query });
      socket.on('connect', () => reslv(socket));
      socket.on("disconnect", (message) => reslv(null));
      socket.on("error", (err) => reslv(null));
      socket.on("connect_error", (err) => reslv(null));
      kernel.cleanup.add("Socket Test", () => {
        socket?.disconnect();
      });
      socket.emitAsync = emitAsync;
    }else if(socket.connected){
      reslv(socket);
    }else if(socket){
      socket.connect();
      reslv(socket);
    }else{
      reslv(null);
    }
  });
}

const emitAsync = async (path, value) => {
  return new Promise(reslv => {
    socket.emit(path, value, response => {
      reslv(response);
    })
  });
}
