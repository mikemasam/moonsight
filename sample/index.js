import { FailedResponse, Response } from '../responders/index.js';
import { IMount, IHttp, ISocket, ISocketMount } from '../handlers/index.js';
import UUID from '../lib/universal.identity.js';

export const ihttp = IHttp(async (req, res, AppState) => {
  const lock = await AppState.queue('test');
  if(lock) setTimeout(() => lock.clear(), 100);
  return Response({ lock, name: 'this is a name' });
}, []);

//user, business, device
export const isocket = ISocket(async ({ socket, body }) => {
  console.log(body);
  return Response({ body, name: "this is name " });
}, ['socket.auth']);

export const isocketmount = ISocketMount(async ({ socket, ...req }) => {
  //console.log(socket.id);
  //throw FailedResponse({ message: "Connection rejected, invalid authentication" });
});

export const imount = IMount(async () => {
  const res = UUID.entity('PAYMENT', 0)
  //console.log(UUID.latestVersion('1000....'));
  //console.log('UUID Entity', res);
});
