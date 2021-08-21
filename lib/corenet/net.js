import CoreNetQuery from './query.js';
import { io } from "socket.io-client";
export default class CoreNetSelector {
  constructor(ctx){
    this.socket = null;
    this.ready = false;
  }
  init(ctx){
    this.ctx = ctx;
    const { events, opts } = this.ctx;
    console.log(`[KernelJs] ~ CoreNet: connecting...`);
    events.on("kernel.ready", () => {
      this.socket = io(opts.coreHost + '/core', {
        query: {
          channelName: opts.channelName
        }
      });
      events.emit("kernel.corenet.connection", this.socket);
      this.socket.on("connect", () => this._ready());
      this.socket.on("disconnect", (reason) => this._disconnected(reason));
    });
    return this;
  }
  _disconnected(reason){
    this.ready = false; 
    console.log(`[KernelJs] ~ CoreNet: disconnected ${reason}`);
  }
  _ready(){
    console.log(`[KernelJs] ~ CoreNet: connected`);
    this.ready = true;
  }
  isConnected(){
    return this.socket.connected;
  }
  select(channel = 'core'){
    const query = new CoreNetQuery(this.socket, channel || 'core');
    return query;
  }
}

