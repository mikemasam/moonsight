import HttpDoctor from './http.js';
import SocketDoctor from './socket.js';
export default async function doctor(ctx){
  if(ctx.opts.mocking?.socket){
    await SocketDoctor(ctx);
  }
  ctx.events.emit("kernel.internal.doctor.ready");
}
