import HttpApp from './lib/http.js';
import SocketApp from './lib/socket.js';
import SystemEvents from './lib/events.js';
import Enviroment from './lib/enviroment.js';
import HttpRouter from './lib/http-router.js';
//system context
let context = {
  opts: {
    api: '',
    port: null
  },
  net: {
  } 
};

export default async function boot(opts){
  context = await Enviroment(context, opts)
    .then(HttpApp)
    .then(SocketApp)
    .then(SystemEvents)
    .then(HttpRouter);
  const { net: { app, _httpServer }, opts: { api, port }  } = context;
  if(!port) throw `Invalid server port [port] = ${port}.`;
  _httpServer.listen(process.env.HTTP_PORT, () => {
    console.log(`http listening on http://localhost:${process.env.HTTP_PORT}/`)
  });
  //console.log(app._router.stack);
  return context;
}

boot({}).catch(console.log);
