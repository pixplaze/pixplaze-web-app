/**
 * WebSocket wrapper class used to save config between disconnections
 * or on reopening Web Socket connection.
 */
export const createWebSocket = (host, path, type) => {
  const config = {
    host: host,
    path: path,
    type: type,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null
  }

  let connection = {}

  const setIfConnectionOpened = (prop, value) => {
    if (connection) {
      connection[prop] = value;
    }
    config[prop] = value;
  }

  const invokeIfConnectionOpened = (func, args) => {
    try {
      func.call(connection, args);
    } catch (err) {
      throw new Error('The connection was never initialized!');
    }
  }

  return {
    open: () => {
      connection = new WebSocket(`${type}://${host}/${path}`);
      connection.onopen = config.onopen;
      connection.onclose = config.onclose;
      connection.onmessage = config.onmessage;
      connection.onerror = config.onerror;
    },
    close() {
      invokeIfConnectionOpened(connection.close);
      connection = null;
    },
    send(data) {
      invokeIfConnectionOpened(connection.send, data)
    },
    set onmessage(func) {
      setIfConnectionOpened('onmessage', func);
    },
    set onerror(func) {
      setIfConnectionOpened('onerror', func);
    },
    set onopen(func) {
      setIfConnectionOpened('onopen', func);
    },
    set onclose(func) {
      setIfConnectionOpened('onclose', func);
    }
  }
}
