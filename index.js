import HttpApp from './lib/http.js';
import SocketApp from './lib/socket.js';
import SystemEvents from './lib/events.js';
import Enviroment from './lib/enviroment.js';
import Router from './lib/router.js';
import { UnhandledReponse, NotFound, PaginatedResponse, Response, EmptyResponse } from './responders/index.js';

//system context
let context = {
  opts: {
    api: '',
    port: null
  },
  net: {
  } 
};

export default async function boot(args){
  context = await Enviroment(context, args)
    .then(HttpApp)
    .then(SocketApp)
    .then(SystemEvents)
    .then(Router);
  const { net: { app, _httpServer }, opts  } = context;
  if(!opts.port) throw `Invalid server port [port] = ${opts.port}.`;
  _httpServer.listen(opts.port, () => {
    console.log(`http listening on http://localhost:${opts.port}/`)
  });
  //console.log(app._router.stack);
  return context;
}

export { UnhandledReponse, NotFound, PaginatedResponse, Response, EmptyResponse }
