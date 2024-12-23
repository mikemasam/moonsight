import Kernel  from "./src/index";
import path from "path";
Kernel({
  host: "localhost",
  version: "1.0.0",
  autoBoot: true,
  port: 3003,
  mocking: false,
  apiPath: path.resolve("dev/api"),
  apiMount: "api",
  apiMiddlewares: path.resolve("dev/middlewares"),
  channelName: "test",
  nodeIdentity: "111",
  //coreHost: "localhost:5000",
  /*
  mountCore: {
    allowedIPs: "127.0.0.1, 0.0.0.0, 172.27.208.1",
    port: 5551,
    mount: true,
  },
  redis: {
    url: "redis://localhost:6379",
  },
  */
  settings: {
    test: "testing",
  },
  logging: {
    //pub: true,
    //sub: true,
    //all: true,
    http: false,
    kernel: false,
    exception: true,
    error: true,
    job: true,
    queue: true,
    app: {
      user: true 
    },
    format: "simple"
  },
}).then((e) => {
  //console.log(e);
});

