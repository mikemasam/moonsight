import { resolve } from "path";
import { AppLogger, AppState, ICore, IJob, ISocket } from "../../../src";

export const isocket = ISocket(
  async ({ socket, body }, res) => {
    console.log(":api:users: isocket body", body);
    return res.ok({ name: "this is name " });
  },
  ["socket.auth"]
);

export const icore = ICore(
  async ({ socket, body }, res) => {
    console.log("users - ", body);
    return res.ok({ name: "this is name " });
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
  AppLogger.log("user", "users index job")
  return [IJob.OK, "Just like that"];
};
export const ijob = IJob(job, { seconds: 20, instant: true }, { hi: 0 });
