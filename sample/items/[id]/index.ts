import { Response, IHttp, ISocket, CoreNet, ICore } from "../../..";
import { AppContext } from "../../../lib/context";

//TODO: test mount
export default async function mount(ctx: AppContext, opts: any) {
  console.log("should fix this", opts);
}

export const ihttp = IHttp(async (req) => {
  console.log(req.query);
  return Response({ name: "this is name " });
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
