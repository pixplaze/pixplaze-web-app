/**
 * WebSocket wrapper class used to save config between disconnections
 * or on reopening Web Socket connection.
 */
class WebSocketClient {

  constructor(host, path, type) {
    this.config = {
      host: host,
      path: path,
      type: type,
      onopen: null,
      onclose: null,
      onmessage: null,
      onerror: null
    }
    this.connection = {}
    this.host = host;
    this.path = path;
    this.type = type;
  }

  open() {
    this.connection = new WebSocket(`${this.type}://${this.host}/${this.path}`);
    this.connection.onopen = this.config.onopen;
    this.connection.onclose = this.config.onclose;
    this.connection.onmessage = this.config.onmessage;
    this.connection.onerror = this.config.onerror;
  }

  close() {
    this.invokeIfConnectionOpened(this.connection.close);
    this.connection = null;
  }

  send(data) {
    this.invokeIfConnectionOpened(this.connection.send, data)
  }

  set onmessage(func) {
    this.setIfConnectionOpened('onmessage', func);
  }

  set onerror(func) {
    this.setIfConnectionOpened('onerror', func);
  }

  set onopen(func) {
    this.setIfConnectionOpened('onopen', func);
  }

  set onclose(func) {
    this.setIfConnectionOpened('onclose', func);
  }

  setIfConnectionOpened(prop, value) {
    if (this.connection) {
      this.connection[prop] = value;
    }
    this.config[prop] = value;
  }

  invokeIfConnectionOpened(func, args) {
    try {
      func.call(this.connection, args);
    } catch (err) {
      throw new Error('The connection was never initialized!');
    }
  }
}

export default (host, path, type) => new WebSocketClient(host, path, type);
