import { Response } from '../responders/index.js';
import { IHttp, ISocket } from '../handlers/index.js';

const http = async (req, res, AppState) => {
  const lock = await AppState.queue('test');
  if(lock) setTimeout(() => lock.clear(), 5000);
  return Response({ lock, name: 'this is a name' });
}

export const ihttp = IHttp(http, []);


export const isocket = ISocket(async ({ socket, body, user, business, device }) => {
  //console.log(body);
  return Response({ name: "this is name " });
}, ['socket.auth']);

