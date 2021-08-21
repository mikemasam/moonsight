import Kernel from './index.js';
import path from 'path';
const kernel = await Kernel({
  port: 3003,
  apiPath: path.resolve('sample'),
  middlewares: path.resolve('middlewares'),
  apiMount: 'api',
  channelName: 'test',
  coreHost: 'http://localhost:3003',
  mountCore: {
    allowedIPs: '127.0.0.1, 0.0.0.0'
  },
  connectCore: true,
  logging: {
    http: true,
    error: true
  }
}).catch(console.log);

//console.log(Object.keys(kernel));
/*
const isocket = ISocket(({ socket, data, user, business, device }) => {
  return Response({});
}, ['auth', '']);
*/
const { socketIO } = kernel.net;

/*
socketIO.on("connection", socket => {
  socket.on("message", (data) => {
    console.log(data);
    socket.emit("message", "i received a message " + data);
  })
});
*/
