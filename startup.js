//copy this to your new project as index
//to start 
//#> node index.js
import path from 'path';
import Kernel from 'deba-kerneljs';
const context = await Kernel({
  apiPath: path.resolve('api'),
  //middlewares: path.resolve('middlewares'),
  port: 8080,
  apiMount: 'api',
  channelName: '',                    //corenet identity 
  coreHost: 'http://localhost:4000',  //for corenet client connecting to master
  mountCore: {                        //for corenet master
    allowedIPs: ['0.0.0.0']
  },
  settings: {
    test: 'testing'
  },
  logging: {
    error: true,
    http: false,
    socket: false ,
    core: false
  }
});
