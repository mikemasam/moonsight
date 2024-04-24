import { IMount, AppState, CoreNet } from "../../../src";

export const imount = IMount(async (appState: AppState) => {
  appState.events().on("kernel.connection", (opts) => load$subs$state(opts));
  //console.log("mounted");
});

const load$subs$state = async (opts: any) => {
  if (opts.state != "connection") return;
  const subs_state = await CoreNet.select(opts.channel.name).query(
    ":api:kernel:subscriptions:state",
    {}
  );
  //console.log("substate", subs_state);
  //await CoreNet.select(opts.channel.name).query(':api:kernel:connection', {});
};
