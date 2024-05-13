
import { AppLogger, AppState, CoreNet, IConsole } from "../../src";

const job = async (
  appState: AppState,
  c: Object
) => {
  //appState.queue("api:users");
  //return IJob.BACKOFF;
  //console.log("Job called");
  //AppState.queueJob(":api:users", { i: 0 });
  //throw new Error("112121");
  //AppLogger.log("user", "users index console")
  //console.log("iconsole")
};
export const ijob = IConsole(job, {
  //event_name: "kernel.ready"
} );
