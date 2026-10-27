import {createWebSocket} from '$api/ws.config.js';
import {PluginAccessDeniedError} from '$api/servers.api.js';
import {notifications} from '$scripts/notifications.svelte.js';
import {pluginTokens} from '$scripts/pluginTokens.svelte.js';
import {mapMessage} from '$util/message.mapper.js';
import {parseJwt} from '$util/jwt.util.js';

/** Коды закрытия сокета плагина: токен не принят и нет прав (п. 23 схемы авторизации). */
const CLOSE_UNAUTHORIZED = 4401;
const CLOSE_FORBIDDEN = 4403;

/**
 * Websocket-поток сообщений сервера (консоль или чат плагина Pixplaze). После подключения сервер
 * присылает историю первым кадром (JSON-массив `MinecraftMessageInfo`) — она заменяет список,
 * поэтому при переподключении история не задваивается; дальше каждое сообщение — отдельным
 * кадром (JSON-объект). Подключение переоткрывается само, пока его не закрыли {@link close}.
 *
 * Авторизация — первым кадром `{"type":"AUTH","token":…}` с токеном доступа к плагину; историю плагин
 * присылает только после него. Перед истечением токена шлётся новый `AUTH`. Закрытие с кодом 4401
 * (токен не принят) — тихий новый обмен и переподключение, 4403 (нет прав) — сообщение, без переподключения.
 *
 * О потере и восстановлении подключения сообщает центр уведомлений.
 */
export class MessageStream {
  #messages = $state([]);
  #connected = $state(false);
  #forbidden = $state(false);
  #playerUuid = $state(null);
  #ws;
  #serverId;
  #renewTimer = null;
  #capacity;
  #label;
  /** Уведомление о потере подключения; есть, пока подключение не восстановлено. */
  #lostNotice = null;

  /**
   * @param {number} serverId сервер: чей токен доступа к плагину слать
   * @param {string} host адрес плагина `host:port`
   * @param {string} path путь сокета (`console`, `chat`)
   * @param {{capacity?: number, label: string}} options capacity — сколько сообщений держать;
   *   label — что подключается, для уведомлений: «консоли сервера», «чату сервера»
   */
  constructor(serverId, host, path, {capacity = 256, label}) {
    this.#serverId = serverId;
    this.#capacity = capacity;
    this.#label = label;
    // Схема — как у страницы: ws:// с https-страницы браузер заблокирует
    this.#ws = createWebSocket(host, path, location.protocol === 'https:' ? 'wss' : 'ws');
    this.#ws.onopen = () => this.#authorize();
    this.#ws.onreconnect = () => this.#onConnection(false);
    this.#ws.onclosecode = (code) => this.#onCloseCode(code);
    this.#ws.onmessage = ({data}) => this.#receive(data);
  }

  /** Сообщения, от старых к новым (модели {@link mapMessage}). */
  get messages() {
    // return this.#messages.slice(0, 2);
    return this.#messages;
  }

  /** Подключение открыто и авторизовано: до этого и пока идёт переподключение отправлять нельзя. */
  get connected() {
    return this.#connected;
  }

  /** UUID игрока, от имени которого пишет пользователь (`sub` токена доступа к плагину); null — неизвестен. */
  get playerUuid() {
    return this.#playerUuid;
  }

  /** Плагин отказал в доступе (нет прав): подключение не восстанавливается. */
  get forbidden() {
    return this.#forbidden;
  }

  isOwnMessage(messageAuthorUuid) {
    return messageAuthorUuid && messageAuthorUuid === this.playerUuid;
  }

  open() {
    this.#ws.open();
  }

  /** Закрыть подключение без переподключения (уход со страницы, смена сервера). */
  close() {
    clearTimeout(this.#renewTimer);
    this.#ws.close();
    this.#connected = false;
    if (this.#lostNotice !== null) {
      notifications.close(this.#lostNotice);
      this.#lostNotice = null;
    }
  }

  /** Отправить строку: команду (`/list`) или сообщение. Только при открытом подключении. */
  send(line) {
    if (!this.#connected) return;
    this.#ws.send(line);
  }

  /** Первый кадр подключения — AUTH; затем подключение считается открытым. */
  async #authorize() {
    try {
      await this.#sendAuth();
      this.#onConnection(true);
    } catch (error) {
      if (error instanceof PluginAccessDeniedError) {
        this.#deny();
      } else {
        // web-api недоступен — обычное переподключение с паузой
        this.#ws.drop();
      }
    }
  }

  /** Шлёт AUTH с действующим токеном и ставит повторный AUTH перед его истечением. */
  async #sendAuth() {
    const entry = await pluginTokens.get(this.#serverId);
    this.#ws.send(JSON.stringify({type: 'AUTH', token: entry.accessToken}));
    this.#playerUuid = playerUuidOf(entry.accessToken);
    clearTimeout(this.#renewTimer);
    this.#renewTimer = setTimeout(() => this.#sendAuth().catch(() => this.#ws.drop()), pluginTokens.renewIn(entry));
  }

  #onCloseCode(code) {
    clearTimeout(this.#renewTimer);
    if (code === CLOSE_UNAUTHORIZED) {
      // Тихо: без уведомления о потере, но до нового AUTH отправлять нельзя
      this.#connected = false;
      pluginTokens.invalidate(this.#serverId);
      return 'now';
    }
    if (code === CLOSE_FORBIDDEN) {
      this.#deny();
      return 'stop';
    }
    return null;
  }

  #deny() {
    this.close();
    this.#forbidden = true;
    notifications.error(`Нет доступа к ${this.#label}`);
  }

  #onConnection(isOpen) {
    this.#connected = isOpen;
    if (!isOpen) {
      // Повтор того же текста перезапускает таймер: уведомление висит, пока идут попытки
      this.#lostNotice = notifications.warning(`Нет подключения к ${this.#label}, переподключаемся…`);
    } else if (this.#lostNotice !== null) {
      notifications.close(this.#lostNotice);
      this.#lostNotice = null;
      notifications.info(`Подключение к ${this.#label} восстановлено`);
    }
  }

  #receive(data) {
    let parsed;
    try {
      parsed = JSON.parse(data);
    } catch {
      console.warn('Message stream: frame is not JSON, skipped', data);
      return;
    }

    const received = (Array.isArray(parsed) ? parsed : [parsed]).map(mapMessage);
    const messages = Array.isArray(parsed) ? received : [...this.#messages, ...received];
    this.#messages = messages.slice(-this.#capacity);
  }
}

/** `sub` токена доступа к плагину — UUID игрока; у владельца без игрока или битого токена — null. */
function playerUuidOf(accessToken) {
  try {
    return parseJwt(accessToken).sub ?? null;
  } catch {
    return null;
  }
}
