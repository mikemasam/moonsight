import HttpApp from './lib/http.js';
import RedisApp from './lib/redis.js';
import QueueApp from './lib/queue.js';
import SocketApp from './lib/socket/index.js';
import SystemEvents from './lib/events.js';
import Enviroment from './lib/enviroment.js';
import Router from './lib/router/index.js';
import Doctor from './doctor/index.js';
import UID from './lib/universal.identity.js';
import CoreNetwork, { CoreNet } from './lib/corenet/index.js';
import { 
  UnhandledReponse, NotFound, 
  PaginatedResponse, Response, 
  FailedResponse, EmptyResponse,
  Request, NoResponse
} from './responders/index.js';

import { IHttp, IJob, ISocket, ISocketMount, ICore, IMount, IBatchHttp } from './handlers/index.js';

//system context
let context_init = {
  opts: {
    autoBoot: true,
    mocking: false,
    apiPath: '',
    apiMiddlewares: null,
    port: null,
    shutdownTimeout: 30,
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
      job: false,
      kernel: false
    }
  },
  net: {
    httpServer: null,
    middlewares: {},
    httpApp: null,
    socketIO: null,
    coreIO: null
  },
  ready: undefined,
  state: {
    up: false,
    count: 0,
    shutdown: false,
    timeout: 0,
    corenetReady: false
  }
};

export default async function create$kernel(args){
  global.deba_kernel_ctx = await Enviroment(context_init, args)
  global.deba_kernel_ctx = await SystemEvents(global.deba_kernel_ctx)
    .then(QueueApp)
    .then(HttpApp)
    .then(RedisApp)
    .then(SocketApp)
    .then(Router)
    .then(CoreNetwork);
  const { events, net: { RedisClient }, opts  } = global.deba_kernel_ctx;
  if(!opts.port) throw new Error(`[KernelJs] ~ Invalid server port [port] = ${opts.port}.`);
  global.deba_kernel_ctx.boot = async () => {
    if(global.deba_kernel_ctx.state.up) return;
    global.deba_kernel_ctx.state.up = true;
    return new Promise(async reslv => {
      global.deba_kernel_ctx.events.once('kernel.ready', () => reslv(true))
      await global.deba_kernel_ctx.net.bootRedis();
      global.deba_kernel_ctx.net.startup();
    });
  }
  if(opts.autoBoot) await global.deba_kernel_ctx.boot();
  return global.deba_kernel_ctx;
}

const UUID = UID;
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
  UID,
  IJob,
  Doctor,
}

