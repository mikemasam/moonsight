import { IMount, ICore } from '../../handlers/index.js';
import { CoreNet } from '../../lib/corenet/index.js';

export const imount = IMount(async (AppState) => {
  AppState.events().on("kernel.connection", (opts) => load$subs$state(opts));
  console.log("mounted");
});

const load$subs$state = async (opts) => {
  if(opts.state != 'connection') return;
  const subs_state = await CoreNet.select(opts.channel.name).query(':api:kernel:subscriptions:state', {});
  console.log("substate", subs_state);
  //await CoreNet.select(opts.channel.name).query(':api:kernel:connection', {});
}

