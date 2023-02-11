// @Deprecated -- see dev.js
//copy this to your new project as index
//to start 
//#> node index.js
import path from 'path';
import Kernel from './index.js';
const context = await Kernel({
  apiPath: path.resolve('sample'),
  apiMount: 'api',
  middlewares: path.resolve('middlewares'),
  port: 8080,
  nodeIdentity: 800,
  channelName: 'Test1',                    //corenet identity 
  coreHost: 'http://localhost:5000',  //for corenet client connecting to master
  mountCore: {                        //for corenet master
    allowedIPs: ['0.0.0.0'],
    mount: false
  },
  settings: {
    test: 'testing'
  },
  redis: {
    url: undefined
  },
  logging: {
    error: true,
    http: false,
    socket: false ,
    core: false
  }
});
