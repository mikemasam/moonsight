import { QueueOptions } from "../handlers/BaseHander";
import { getContext } from "../lib/context";

export class AppState {
  events() {
    return getContext().events;
  }
  io() {
    return getContext().net.socketIO;
  }
  channel(): string {
    return getContext().opts.channelName;
  }

  //dictionary
  get<T>(name: string): T | undefined | null {
    return getContext().opts.settings[name];
  }
  put(name: string, data: any) {
    getContext().opts.settings[name] = data;
  }
  queue(name: string, opts?: QueueOptions) {
    return getContext().queue.aquire(name, opts);
  }
  queueJob(name: string, opts?: any) {
    return getContext().events.emit(`kernel.jobs.run.${name}`, name, opts);
  }
  queuePub(name: string, payload: any) {
    return getContext().events.emit(`kernel.subpub.pub`, name, payload);
  }

  //stack
  push(name: string, data: any) {
    getContext().opts.settings[name]?.push(data);
    console.log("AppState.push --> removed");
  }
  remove(name: string, index: number) {
    console.log("AppState.remove --> removed");
    return getContext().opts.settings[name]?.splice(index, 1);
  }
}

export default function CreateAppState() {
  return new AppState();
}
