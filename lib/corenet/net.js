import CoreNetQuery from './query.js';
import { io } from "socket.io-client";
import { NotFound } from '../../responders/index.js';
import logger from '../logger.js';

export default class CoreNetSelector {
  constructor(){
    this.socket = null;
    this.ready = null;
    this.isLocal = false;
    this.ctx = null;
    this.queue = [];
  }
  connectRemote(ctx){
    this.ready = false;
    this.ctx = ctx;
    const { events, opts } = this.ctx;
    this.ctx.cleanup.add("Remote Core", () => {
      this.socket?.disconnect();
    });
    events.once("kernel.ready", () => {
      logger.kernel(`CoreNet: connecting to ${opts.coreHost}...`);
      this.socket = io(opts.coreHost, {
        transports: ["websocket"],
        query: {
          channelName: opts.channelName,
        }
      });
      events.emit("kernel.corenet.connection", this.socket);
      this.socket.on("connect", () => this._connected());
      this.socket.on("disconnect", (reason) => this._disconnected(reason));
      this.socket.onAny((...args) => this._handleAll(...args));
    });
    return this;
  }
  connectLocal(ctx){
    this.ready = false;
    this.ctx = ctx;
    const { opts } = this.ctx;
    this.ctx.events.once("kernel.ready", () => {
      logger.kernel(`CoreNet: local channel = (${opts.channelName})`);
      this.isLocal = true;
      this.ready = true;
      this.clearQueue();
      this.ctx.events.emit("kernel.internal.corenet.ready", { });
    })
    return this;
  }
  _handleAll(event, ...args){
    if(this.socket.hasListeners(event)){
      //console.log("event found");
    }else{
      if(this.ctx.opts.logging.error)
        console.log("[KernelJs] ~ CoreNet: event not found", event);
      const log = {
        path: 'corenet.channel.receiver',
        ctx: this.ctx,
        startTime: Date.now(),
      };

      const { opts } = this.ctx;
      const [body, fn] = args;
      const ip = opts.coreHost;
      const req = { method: 'icore', socket: this.socket, body, originalUrl: event, ip }
      const res = { fn };
      NotFound()(log, req, res);
    }
  }

  _disconnected(reason){
    this.ready = false; 
    const { opts } = this.ctx;
    logger.kernel(`CoreNet: disconnected from ${opts.coreHost} - ${reason}`);
  }
  _connected(){
    this.ready = true;
    const { opts } = this.ctx;
    logger.kernel(`CoreNet: connected to ${opts.coreHost}`);
    this.clearQueue();
    this.ctx.events.emit("kernel.internal.corenet.ready", { ready: true });
  }

  clearQueue(){
    let task = this.queue.pop();
    while(task){
      task();
      task = this.queue.pop();
    }
  }

  isConnected(){
    return this.socket.connected;
  }
  select(channel = 'core'){
    return new CoreNetQuery(this, channel);
  }
  async query(dpath, body){
    return (new CoreNetQuery(this)).dpathQuery(dpath, body);
  }
}

