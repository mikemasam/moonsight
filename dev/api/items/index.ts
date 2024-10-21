import {
  AppState,
  CoreNet,
  ICore,
  IHttp,
  ISocket,
  ISub,
} from "../../../src";

const ihttp = IHttp(async (_, res) => {
  return res.failed();
}, []);

const mobileitems = ISocket(
  async ({ socket, body }, res) => {
    console.log("testing ....", body);
    const net = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", net);
    return res.ok({ name: "this is name " });
  },
  ["socket.auth"],
);

const icore = ICore(
  async ({ socket, body }, res) => {
    console.log("testing ....", body);
    const net = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", net);
    return res.ok({ name: "this is name " });
  },
  ["core.auth"],
);

const channels = [
  "deba.market:products:changed1",
  "deba.market:products:changed2",
];
const isub = ISub(
  async (appState: AppState, channel: string, payload: Object) => {
    //console.log(channel);
    //console.log("product changed", payload);
  },
  channels,
);

export { isub, ihttp, mobileitems, icore };
