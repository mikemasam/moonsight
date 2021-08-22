import HttpApp from './lib/http.js';
import SocketApp from './lib/socket/index.js';
import SystemEvents from './lib/events.js';
import Enviroment from './lib/enviroment.js';
import Router from './lib/router/index.js';
import CoreNetwork, { CoreNet } from './lib/corenet/index.js';
import { 
  UnhandledReponse, NotFound, 
  PaginatedResponse, Response, 
  FailedResponse, EmptyResponse 
} from './responders/index.js';

import { IHttp, ISocket, ICore } from './handlers/index.js';

//system context
let context = {
  opts: {
    apiPath: '',
    apiMiddlewares: null,
    port: null,
    mountCore: false,
    logging: {
      http: false,
      core: false,
      socket: false,
      error: false 
    }
  },
  net: {
    httpServer: null,
    middlewares: {},
    httpApp: null,
    socketIO: null,
    coreIO: null
  } 
};

export default async function boot(args){
  context = await Enviroment(context, args)
    .then(HttpApp)
    .then(SystemEvents)
    .then(SocketApp)
    .then(Router)
    .then(CoreNetwork);
  const { events, net: { app, httpServer }, opts  } = context;
  if(!opts.port) throw `[KernelJs] Invalid server port [port] = ${opts.port}.`;
  httpServer.listen(opts.port, '0.0.0.0', () => {
    console.log(`[KernelJs] ~ started on host:${opts.port}`)
    events.emit('kernel.ready');
  });
  //console.log(app._router.stack);
  return context;
}

export { 
  UnhandledReponse, 
  NotFound, 
  PaginatedResponse, 
  Response, 
  EmptyResponse, 
  FailedResponse, 
  IHttp,
  ISocket,
  ICore,
  CoreNet
}
