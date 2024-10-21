import { AppContext, Response, IHttp, ISocket, CoreNet, ICore } from "../../../../src";

//TODO: test mount
export default async function mount(ctx: AppContext, opts: any) {
  console.log("should fix this", opts);
}

export const ihttp = IHttp(async (req, res) => {
  console.log(req.query);
  return res.ok({ name: "this is name " });
}, []);

export const mobileitems = ISocket(
  async ({ socket, body } ,res) => {
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
