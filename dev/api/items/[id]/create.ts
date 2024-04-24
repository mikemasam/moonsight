import { CoreNet, ICore, IHttp, ISocket, Response } from "../../../../src";

export const ihttp = IHttp(
  async (req) => {
    console.log(req.params);
    console.log(req.query);
    return Response({ name: "this is name " });
  },
  ["http.auth"]
);

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
