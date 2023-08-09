import Kernel from "./index";
import path from "path";
Kernel({
  host: "localhost",
  version: "1.0.0",
  autoBoot: true,
  coreHost: "localhost:5000",
  port: 3003,
  mocking: false,
  apiPath: path.resolve("sample"),
  apiMount: "api",
  apiMiddlewares: path.resolve("middlewares"),
  channelName: "test",
  nodeIdentity: "111",
  mountCore: {
    allowedIPs: "127.0.0.1, 0.0.0.0, 172.27.208.1",
    port: 5555,
    mount: false,
  },
  redis: {
    url: "redis://localhost:6379",
  },
  settings: {
    test: "testing",
  },
  logging: {
    pub: true,
    sub: true,
    all: true,
  },
}).then((e) => {
  //console.log(e);
});
