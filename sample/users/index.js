import { IJob, ISocket, IHttp, ICore } from '../../handlers/index.js';
import { Response } from '../../responders/index.js';
import { CoreNet } from '../../lib/corenet/index.js';

export const isocket = ISocket(async ({ socket, body, user, business, device }) => {
  console.log(":api:users: isocket body", body);
  return Response({ name: "this is name " });
}, ['socket.auth']);

export const icore = ICore(async ({ socket, body, device }) => {
  console.log('users - ', body);
  return Response({ name: "this is name " });
}, ['core.auth']);

// config
// - schedule
// - not busy
// - 
const job = async (AppState) => {
  //CoreJob.queue("api:users", { hi: 1 });
  //return IJob.BACKOFF;
  //console.log("Job called");
  AppState.queueJob(":api:users", { i: 0 });
  return IJob.OK;
}
export const ijob = IJob(job, { seconds: 5 }, { hi: 0 });

