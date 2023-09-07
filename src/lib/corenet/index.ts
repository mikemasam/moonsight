import { AppContext } from "../context.js";
import CoreNetSelector from "./net";
const CoreNet = new CoreNetSelector();
export default async () => {
  const ctx: AppContext = global.deba_kernel_ctx;
  const { mountCore, coreHost } = ctx.opts;
  if (coreHost) {
    ctx.net.coreNet = CoreNet.connectRemote();
  } else if (mountCore?.mount) {
    ctx.net.coreNet = CoreNet.connectLocal();
  }
  return ctx;
};

export { CoreNet };
