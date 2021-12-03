import { NotFound } from '../../responders/index.js';

export default class CoreNetQuery {
  constructor(selector, channel){
    this.selector = selector;
    this.channel = channel || 'core';
  }

  async query(event, body){
    if(this.selector.ready === null){
      return new Promise((resolv) => {
        this.selector.queue.push(() => resolv(this._query(event, body)));
      });
    }
    return this._query(event, body);
  }

  async _query(event, body){
    if(this.selector.isLocal){
      return this.__localQuery(event, body);
    }else{
      return this.__remoteQuery(event, body);
    }
  }

  async __remoteQuery(event, body){
    return new Promise(async (resolve, reject) => {
      if(!this.selector.ready)
        return this.__handleFailed(this.selector.socket, event, body, resolve, 502);
      const data = { channel: this.channel, event, body }
      this.selector.socket.emit(this.channel == 'core' ? event : "kernel.corenet.channel.transport", data, (response) => {
        resolve(response)
      });
    });
  }
  async __localQuery(event, body){
    return new Promise(async (resolve, reject) => {
      if(!this.selector.ready)
        return this.__handleFailed(null, event, body, resolve, 502);
      const { coreIO } = this.selector.ctx.net;
      const sockets = await coreIO.fetchSockets();
      const data = { channel: this.channel, event, body }
      let consumer = sockets.find(s => s.handshake.query.channelName == this.channel);
      if(!consumer?.connected){
        return this.__handleFailed(consumer, event, body, resolve, 503);
      }else{
        return consumer.emit(event, body, resolve);
      }
    });
  }

  async __handleFailed(socket, event, body, fn, status = 404){
    const log = {
      path: 'kernel.corenet.channel.transport',
      ctx: this.selector.ctx,
      startTime: Date.now(),
    };
    const ip = "";
    const req = { method: 'icore', socket, body, originalUrl: event, ip }
    const res = { fn };
    return NotFound({ status, message: 'Service not available at the moment, please try again later.' })(log, req, res);
  }
}
