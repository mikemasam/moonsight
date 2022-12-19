import boot from './boot.js';
import path from 'path';
const kernel = await boot({});
//setTimeout(() => {
//  kernel.cleanup.dispose();
//  //console.log(process._getActiveHandles());
//}, 3000);
  //await kernel.boot();
  //logging: {
    //http: true,
//    core: true,
    //socket: true,
    //loader: true,
//    networking: true,
//    error: true,
//    job: true,
//    socketmount: true,
//    mount: true
//console.log(Object.keys(kernel));
/*
const isocket = ISocket(({ socket, data, user, business, device }) => {
  return Response({});
}, ['auth', '']);
*/
//const { socketIO } = kernel.net;

/*
socketIO.on("connection", socket => {
  socket.on("message", (data) => {
    console.log(data);
    socket.emit("message", "i received a message " + data);
  })
});
*/
