/** Паузы переподключения: удваивается от первой до последней, после успешного подключения — снова первая. */
const RECONNECT_DELAY_MIN = 1000;
const RECONNECT_DELAY_MAX = 30000;

/**
 * WebSocket wrapper class used to save config between disconnections
 * or on reopening Web Socket connection.
 *
 * Закрытое не через {@link close} подключение (перезапуск сервера, обрыв сети) переоткрывается
 * с растущей паузой; обработчики переносятся на новое подключение. Обработчик `onclosecode`
 * может решить иначе по коду закрытия: `'now'` — переподключиться сразу и молча (новый токен),
 * `'stop'` — больше не переподключаться (нет прав).
 */
export const createWebSocket = (host, path, type) => {
  const config = {
    host: host,
    path: path,
    type: type,
    onopen: null,
    onclose: null,
    onmessage: null,
    onerror: null,
    /** Подключение потеряно, следующая попытка через `delay` мс. */
    onreconnect: null,
    /** Код закрытия → `'now'` | `'stop'` | иначе — обычное переподключение с паузой. */
    onclosecode: null
  }

  let connection = {}
  let reconnectTimer = null;
  let reconnectDelay = RECONNECT_DELAY_MIN;

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

  const connect = () => {
    const socket = new WebSocket(`${type}://${host}/${path}`);
    connection = socket;
    socket.onopen = config.onopen;
    socket.onclose = config.onclose;
    socket.onmessage = config.onmessage;
    socket.onerror = config.onerror;
    socket.addEventListener('open', () => reconnectDelay = RECONNECT_DELAY_MIN);
    socket.addEventListener('close', ({code, reason, wasClean}) => {
      // Код закрытия: 1001 — сервер закрыл по тайм-ауту простоя, 1000 — закрыли сами, 1006 — обрыв без кадра закрытия
      console.info(`WebSocket ${type}://${host}/${path} closed: ${code} ${reason} (clean: ${wasClean})`);
      // Закрыли через close() — connection уже сброшен; иначе переподключаемся
      if (connection !== socket) return;
      const decision = config.onclosecode?.(code);
      if (decision === 'stop') {
        connection = null;
        return;
      }
      if (decision === 'now') {
        reconnectTimer = setTimeout(connect, 0);
        return;
      }
      config.onreconnect?.(reconnectDelay);
      reconnectTimer = setTimeout(connect, reconnectDelay);
      reconnectDelay = Math.min(reconnectDelay * 2, RECONNECT_DELAY_MAX);
    });
  }

  return {
    open: () => {
      clearTimeout(reconnectTimer);
      reconnectDelay = RECONNECT_DELAY_MIN;
      connect();
    },
    close() {
      clearTimeout(reconnectTimer);
      // До open() вместо подключения — пустой объект, после close() — null: закрывать нечего
      const socket = connection;
      connection = null;
      if (socket instanceof WebSocket) {
        socket.close();
      }
    },
    send(data) {
      invokeIfConnectionOpened(connection.send, data)
    },
    /** Оборвать текущее подключение: дальше — обычное переподключение с паузой. */
    drop() {
      if (connection instanceof WebSocket) {
        connection.close();
      }
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
    },
    set onreconnect(func) {
      config.onreconnect = func;
    },
    set onclosecode(func) {
      config.onclosecode = func;
    }
  }
}
