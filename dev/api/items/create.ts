import { IHttp, IMount, CoreNet, ICore, ISocket, Response } from "../../../src";

export const loader = IMount(async (a, { path }) => {
  //console.log('loaded ===+++|||>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=>=> ', path);
}, []);

export const ihttp = IHttp(async (req, res) => {
  console.log(req.params);
  console.log(req.query);
  console.log(req.body);
  return res.ok({ body: req.body, name: "this is name " });
}, []);

export const mobileitems = ISocket(
  async ({ socket, body }, res) => {
    console.log("testing ....", body);
    const net = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", net);
    return res.ok({ name: "this is name " });
  },
  ["socket.auth"]
);

export const icore = ICore(
  async ({ socket, body }, res) => {
    console.log("testing ....", body);
    const net  = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", net);
    return res.ok({ name: "this is name " });
  },
  ["core.auth"]
);
