import EventEmitter from 'events';


export default async function SystemEvents(context){
  const events = new EventEmitter();
  setInterval(() => {
    if(context.ready)
      events.emit("kernel.heartbeat", {});
  }, 1000);
  events.on("kernel.ready", () => {
    context.ready = true;
  });
  return {
    ...context,
    events
  }
}
