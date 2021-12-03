import CoreNetQuery from './query.js';
import { io } from "socket.io-client";
import { NotFound } from '../../responders/index.js';

export default class CoreNetSelector {
  constructor(){
    this.socket = null;
    this.ready = false;
    this.isLocal = false;
    this.queue = [];
  }
  connectRemote(ctx){
    this.ctx = ctx;
    const { events, opts } = this.ctx;
    console.log(`[KernelJs] ~ CoreNet: connecting to ${opts.coreHost}...`);
    events.on("kernel.ready", () => {
      this.socket = io(opts.coreHost + '/core', {
        query: {
          channelName: opts.channelName
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
    this.ctx = ctx;
    const { opts } = this.ctx;
    console.log(`[KernelJs] ~ CoreNet: connected to local channel = (${opts.channelName})`);
    this.ready = true;
    this.isLocal = true;
    this.clearQueue();
    return this;
  }
  _handleAll(event, ...args){
    if(this.socket.hasListeners(event)){
      //console.log("event found");
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
    const { opts } = this.ctx;
    console.log(`[KernelJs] ~ CoreNet: disconnected from ${opts.coreHost} - ${reason}`);
  }
  _connected(){
    this.ready = true;
    const { opts } = this.ctx;
    console.log(`[KernelJs] ~ CoreNet: connected to ${opts.coreHost}`);
    this.clearQueue();
  }

  clearQueue(){
    let task = this.queue.pop();
    while(tast){
      task();
      task = this.queue.pop();
    }
  }

  isConnected(){
    return this.socket.connected;
  }
  select(channel = 'core'){
    if(this.ready) return new CoreNetQuery(this.ctx, this, channel);
    return new Promise((resolv) => {
      const task = () => {
        const q = new CoreNetQuery(this.ctx, this, channel);
        resolve(q);
      }
      this.queue.push(task);
    });
  }
}

