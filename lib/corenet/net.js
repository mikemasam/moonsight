import CoreNetQuery from './query.js';
import { io } from "socket.io-client";
import { NotFound } from '../../responders/index.js';

export default class CoreNetSelector {
  constructor(){
    this.socket = null;
    this.ready = false;
    this.connLocal = false;
  }
  connectRemote(ctx){
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
      this.socket.onAny((...args) => this._handleAll(...args));
    });
    return this;
  }
  connectLocal(ctx){
    this.ctx = ctx;
    //const { net, events, opts } = this.ctx;
    console.log(`[KernelJs] ~ CoreNet: connected (local)`);
    this.ready = true;
    this.connLocal = true;
    return this;
  }
  _handleAll(event, ...args){
    if(this.socket.hasListeners(event)){
      console.log("event found");
    }else{
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
    const query = new CoreNetQuery(this.ctx, this.socket, channel, this.connLocal);
    return query;
  }
}

