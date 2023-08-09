import { CoreNet, ICore, ISocket, Response } from "../..";
import IHttp from "../../handlers/IHttp";
import IMount from "../../handlers/IMount";

export const loader = IMount(async (a, { path }) => {
  //console.log('loaded ===+++|||>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=> ', path);
}, []);

export const ihttp = IHttp(async (req) => {
  console.log(req.params);
  console.log(req.query);
  console.log(req.body);
  return Response({ body: req.body, name: "this is name " });
}, []);

export const mobileitems = ISocket(
  async ({ socket, body }) => {
    console.log("testing ....", body);
    const res = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return Response({ name: "this is name " });
  },
  ["socket.auth"]
);

export const icore = ICore(
  async ({ socket, body }) => {
    console.log("testing ....", body);
    const res = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", res);
    return Response({ name: "this is name " });
  },
  ["core.auth"]
);
