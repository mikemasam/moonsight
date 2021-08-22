import { NotFound } from '../../responders/index.js';

export default class CoreNetQuery {
  constructor(ctx, socket, channel, isLocal){
    this.ctx = ctx;
    this.socket = socket;
    this.channel = channel || 'core';
    this.isLocal = isLocal;
  }
  async query(event, body){
    if(this.isLocal){
      return this.__localQuery(event, body);
    }else{
      return this.__remoteQuery(event, body);
    }
  }

  async __remoteQuery(event, body){
    return new Promise((resolve, reject) => {
      const data = { channel: this.channel, event, body }
      this.socket.emit(event == 'core' ? event : "kernel.corenet.channel.transport", data, (response) => {
        resolve(response)
      });
    });
  }
  async __localQuery(event, body){
    const { coreIO } = this.ctx.net;
    const sockets = await coreIO.fetchSockets();
    return new Promise((resolve, reject) => {
      const data = { channel: this.channel, event, body }
      let consumer = sockets.find(s => s.handshake.query.channelName == this.channel);
      if(!consumer?.connected){
        const log = {
          path: 'kernel.corenet.channel.transport',
          ctx: this.ctx,
          startTime: Date.now(),
        };
        const ip = "";
        const req = { method: 'icore', socket: consumer, body, originalUrl: event, ip }
        const res = { fn: resolve };
        NotFound({ message: 'Service not available at the moment, please try again later.' })(log, req, res);
      }else{
        const e = consumer.emit(event, body, resolve);
        console.log(e);
      }
      /*
      this.socket.emit(event == 'core' ? event : "kernel.corenet.channel.transport", data, (response) => {
        resolve(response)
      });
      */
    });

  }
}
