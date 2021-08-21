export default class CoreNetQuery {
  constructor(socket, channel){
    this.socket = socket;
    this.channel = channel;
  }
  async query(event, body){
    return new Promise((resolve, reject) => {
      const data = { channel: this.channel, event, body }
      this.socket.emit(event == 'core' ? event : "kernel.corenet.channel.transport", data, (response) => {
        resolve(response)
      });
    });
  }
}
