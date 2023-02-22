import Kernel from './index.js';
import path from 'path';
const kernel = await Kernel({
  port: 3003,
  mocking: false,
  apiPath: path.resolve('sample'),
  apiMount: 'api',
  middlewares: path.resolve('middlewares'),
  channelName: 'test',
  nodeIdentity: 111,
  mountCore: {
    allowedIPs: '127.0.0.1, 0.0.0.0, 172.27.208.1',
    port: 5555,
    mount: true 
  },
  redis: {
    url: "redis://localhost:6379"
  },
  settings: {
    test: 'testing'
  },
  logging: {
    pub: true,
    sub: true
    //http: true,
    //    core: true,
    //socket: true,
    //loader: true,
    //    networking: true,
    //    error: true,
    //    job: true,
    //    socketmount: true,
    //    mount: true
  },
});
