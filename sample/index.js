import { FailedResponse, Response } from '../responders/index.js';
import { IHttp, ISocket, ISocketMount } from '../handlers/index.js';

const http = async (req, res, AppState) => {
  const lock = await AppState.queue('test');
  if(lock) setTimeout(() => lock.clear(), 500);
  return Response({ lock, name: 'this is a name' });
}

export const ihttp = IHttp(http, []);

//user, business, device
export const isocket = ISocket(async ({ socket, body }) => {
  console.log(body);
  return Response({ body, name: "this is name " });
}, ['socket.auth']);

export const isocketmount = ISocketMount(async ({ socket, ...req }) => {
  console.log(socket.id);
  //throw FailedResponse({ message: "Connection rejected, invalid authentication" });
});
