import { ISocket, IHttp, ICore } from '../../handlers/index.js';
import { Response } from '../../responders/index.js';
import { CoreNet } from '../../lib/corenet/index.js';

export const ihttp = IHttp(async () => {
  throw "i";
},[]);

export const mobileitems = ISocket(async ({ socket, body, user, business, device }) => {
  console.log("testing ....", body);
  const res = await CoreNet.select('test').query(':api:users', { id: "" });
  console.log('response = ', res);
  return Response({ name: "this is name " });
}, ['socket.auth']);

export const icore = ICore(async ({ socket, body, device }) => {
  console.log("testing ....", body);
  const res = await CoreNet.select('test').query(':api:users', { id: "" });
  console.log('response = ', res);
  return Response({ name: "this is name " });
}, ['core.auth']);


