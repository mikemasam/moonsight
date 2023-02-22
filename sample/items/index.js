import { ISocket, IHttp, ICore, ISub } from '../../handlers/index.js';
import { Response } from '../../responders/index.js';
import { CoreNet } from '../../lib/corenet/index.js';

const ihttp = IHttp(async () => {
  throw "i";
},[]);

const mobileitems = ISocket(async ({ socket, body, user, business, device }) => {
  console.log("testing ....", body);
  const res = await CoreNet.select('test').query(':api:users', { id: "" });
  console.log('response = ', res);
  return Response({ name: "this is name " });
}, ['socket.auth']);

const icore = ICore(async ({ socket, body, device }) => {
  console.log("testing ....", body);
  const res = await CoreNet.select('test').query(':api:users', { id: "" });
  console.log('response = ', res);
  return Response({ name: "this is name " });
}, ['core.auth']);



const channels = [
  'deba.market:products:changed1',
  'deba.market:products:changed2'
];
const isub = ISub(async (channel, payload) => {
  //console.log(channel);
  //console.log("product changed", payload);
}, channels);


export {
  isub,
  ihttp,
  mobileitems,
  icore
}
