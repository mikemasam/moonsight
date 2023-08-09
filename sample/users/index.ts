import { ICore, IJob, Response } from "../..";
import ISocket from "../../handlers/ISocket";
import { AppState } from "../../lib/AppState";

export const isocket = ISocket(
  async ({ socket, body }) => {
    console.log(":api:users: isocket body", body);
    return Response({ name: "this is name " });
  },
  ["socket.auth"]
);

export const icore = ICore(
  async ({ socket, body }) => {
    console.log("users - ", body);
    return Response({ name: "this is name " });
  },
  ["core.auth"]
);

// config
// - schedule
// - not busy
// -
const job = async (
  appState: AppState,
  c: Object
): Promise<[number, string]> => {
  //CoreJob.queue("api:users", { hi: 1 });
  //return IJob.BACKOFF;
  //console.log("Job called");
  //AppState.queueJob(":api:users", { i: 0 });
  //throw new Error("112121");
  console.log(c);
  return [IJob.OK, "Just like that"];
};
export const ijob = IJob(job, { seconds: 3, instant: true }, { hi: 0 });
