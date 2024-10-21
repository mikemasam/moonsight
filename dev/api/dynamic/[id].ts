import { CoreNet, ICore, IHttp, ISocket } from "../../../src";

export const ihttp = IHttp(
  async (req, res) => {
    //console.log(req.params);
    //console.log(req.query);
    return res.ok({ results: [1, 2, 3, 4, 5], total: 10 });
  },
  ["http.auth"]
);

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
    const net = await CoreNet.select("test").query(":api:users", { id: "" });
    console.log("response = ", net);
    return res.ok({ name: "this is name " });
  },
  ["core.auth"]
);
