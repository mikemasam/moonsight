import { IHttp, IMount, ISocket, ISocketMount, TestRegex, UUID, z } from "../../src/";

const schema = z
  .object({
    password: z.string(),
    email: z.string().email(),
    identity: z.union([
      z.string().refine(
        (v) => {
          let phone = TestRegex.cleanphone(v);
          if (phone.length == 9) phone = `255${phone}`;
          return TestRegex.testphone(phone);
        },
        { message: "Invalid credentials" },
      ),
      z.string().email(),
    ]),
  })
  .partial({ email: true, identity: true })
  .refine((v) => v.email || v.identity, "Invalid credentials");
export const ihttp = IHttp(
  async (req, res, AppState) => {
    //req.bod
    const body = req.utils.parseBody(schema);
    //req.header("")
    //console.log("req1");
    /*
  const lock = await AppState.queue("test");
  console.log("req2");
  if (lock) setTimeout(() => lock.clear(), 5 * 1000);
  */
    const lock = await req.appState().queue("12312313");
    console.log(req.appState().get("temp"));
    req.header("hi");
    setTimeout(async () => {
      console.log("cleared", lock);
      if (!lock) return;
      await lock.clear();
    }, 1000 * 5);
    return res.Ok({ lock: 1, name: "this is a name" });
    //return undefined;
    //return Response({ lock: 1, name: "this is a name" },);
  },
  ["core.auth"],
);

//user, business, device
export const isocket = ISocket(
  async ({ socket, body }, res) => {
    console.log(body);
    return res.ok({ body, name: "this is name " });
  },
  ["socket.auth"],
);

export const isocketmount = ISocketMount(async ({ socket, ...req }) => {
  //console.log(socket.id);
  //throw FailedResponse({ message: "Connection rejected, invalid authentication" });
});

export const imount = IMount(async (AppState) => {
  /*
  const lock = await AppState.queue("test");
  console.log("req2")
  if (lock) setTimeout(() => lock.clear(), 5 * 1000);
  */

  const res = UUID.basic(1);
  AppState.queuePub("kernel:changed2", {
    test: 1,
    res,
    text: `Connection rejected, invalid authentication " " ; : * ^ ! -- `,
  });
  AppState.queuePub("kernel:changed1", {
    test: 1,
    res,
    text: `Connection accepted, invalid authentication " " ; : * ^ ! -- `,
  });
  //console.log(UUID.latestVersion('1000....'));
  //console.log('UUID Entity', res);
});
