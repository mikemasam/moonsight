import {
  HttpRequest,
  IHttp,
  IMount,
  ISocket,
  ISocketMount,
  Response,
  UUID,
} from "../../src/";

export const ihttp = IHttp(async (req: HttpRequest, res, AppState) => {
  const lock = await AppState.queue("test");
  if (lock) setTimeout(() => lock.clear(), 5 * 1000);
  return Response({ lock, name: "this is a name" });
}, []);

//user, business, device
export const isocket = ISocket(
  async ({ socket, body }) => {
    console.log(body);
    return Response({ body, name: "this is name " });
  },
  ["socket.auth"],
);

export const isocketmount = ISocketMount(async ({ socket, ...req }) => {
  //console.log(socket.id);
  //throw FailedResponse({ message: "Connection rejected, invalid authentication" });
});

export const imount = IMount(async (AppState) => {
  //console.log(AppState);
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