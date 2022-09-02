import HttpApp from './lib/http.js';
import RedisApp from './lib/redis.js';
import QueueApp from './lib/queue.js';
import SocketApp from './lib/socket/index.js';
import SystemEvents from './lib/events.js';
import Enviroment from './lib/enviroment.js';
import Router from './lib/router/index.js';
import UUID from './lib/universal.identity.js';
import CoreNetwork, { CoreNet } from './lib/corenet/index.js';
import { 
  UnhandledReponse, NotFound, 
  PaginatedResponse, Response, 
  FailedResponse, EmptyResponse,
  Request, NoResponse
} from './responders/index.js';

import { IHttp, IJob, ISocket, ISocketMount, ICore, IMount, IBatchHttp } from './handlers/index.js';

//system context
let context = {
  opts: {
    apiPath: '',
    apiMiddlewares: null,
    port: null,
    mountCore: {
      port: null,
      mount: false,
      //allowedIPs: '127.0.0.1, 0.0.0.0, 172.27.208.1'
    },
    settings: {},
    logging: {
      http: false,
      core: false,
      socket: false,
      loader: false,
      error: true,
      networking: false,
      queue: false,
      job: false
    }
  },
  net: {
    httpServer: null,
    middlewares: {},
    httpApp: null,
    socketIO: null,
    coreIO: null
  },
  ready: false
};

export default async function boot(args){
  context = await Enviroment(context, args)
    .then(SystemEvents)
    .then(QueueApp)
    .then(HttpApp)
    .then(RedisApp)
    .then(SocketApp)
    .then(Router)
    .then(CoreNetwork);
  const { events, net: { app, httpServer, coreServer, RedisClient }, opts  } = context;
  if(!opts.port) throw new Error(`[KernelJs] ~ Invalid server port [port] = ${opts.port}.`);
  await RedisClient.connect().catch(err => false);
  if(!RedisClient.isReady) throw new Error(`[KernelJs] ~ Redis connection failed.`);
  else console.log("[KernelJs] ~ Redis connected.");
  if(coreServer){
    coreServer.listen(opts.mountCore.port, '0.0.0.0', () => {
      console.log(`[KernelJs] ~ CoreNet: started on host:${opts.mountCore.port}`)
    });
  }
  httpServer.listen(opts.port, '0.0.0.0', () => {
    console.log(`[KernelJs] ~ Http&SocketIO: started on host:${opts.port}`)
    events.emit('kernel.ready');
  });
  //console.log(app._router.stack);
  return context;
}

export { 
  UnhandledReponse, 
  NotFound, 
  //PaginatedResponse, 
  Response, 
  EmptyResponse, 
  FailedResponse, 
  IHttp,
  ISocket,
  ISocketMount,
  ICore,
  IMount,
  IBatchHttp,
  CoreNet,
  Request,
  NoResponse,
  UUID,
  IJob
}

