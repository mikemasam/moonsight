import { FailedResponse, ICore, ISub, Response } from "../..";
import IHttp from "../../handlers/IHttp";
import ISocket from "../../handlers/ISocket";
import { AppState } from "../../lib/AppState";
import { CoreNet } from "../../lib/corenet";

const ihttp = IHttp(async () => {
  return FailedResponse();
}, []);

const mobileitems = ISocket(
  async ({ socket, body }) => {
    console.log("testing ....", body);
    const res = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return Response({ name: "this is name " });
  },
  ["socket.auth"]
);

const icore = ICore(
  async ({ socket, body }) => {
    console.log("testing ....", body);
    const res = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return Response({ name: "this is name " });
  },
  ["core.auth"]
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
  channels
);

export { isub, ihttp, mobileitems, icore };
