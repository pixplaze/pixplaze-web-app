import {browser} from '$app/environment';
import {token} from '$api/token.svelte.js';
import {favorites} from '$scripts/favorites.svelte.js';
import {buildUserFromToken} from '$util/user.mapper.js';

const ACTIVE_SERVER_KEY = 'activeServer';

/**
 * Активный сервер — тот, с которым работают карта, консоль и чат. Хранится только id: данные сервера
 * берутся из избранного, поэтому не устаревают. Сервер, которого в загруженном избранном нет (убран
 * в другой вкладке или на другом устройстве), выбор сбрасывает. Выбор принадлежит пользователю:
 * при выходе или входе другим аккаунтом сбрасывается.
 */
class ActiveServer {
  /** @type {{ownerId: *, serverId: number} | null} */
  #selection = $state(null);
  #ownerId = $derived(buildUserFromToken(token.value)?.id ?? null);
  #server = $derived(this.#selection
      ? favorites.servers.find(s => s.id === this.#selection.serverId) ?? null
      : null);

  constructor() {
    if (!browser) {
      return;
    }
    this.#selection = read();

    // Выбор в другой вкладке: событие storage приходит только в остальные вкладки.
    window.addEventListener('storage', (event) => {
      if (event.key === ACTIVE_SERVER_KEY || event.key === null) {
        this.#selection = read();
      }
    });

    $effect.root(() => {
      $effect(() => {
        if (this.#selection && this.#selection.ownerId !== this.#ownerId) {
          this.#delete();
        }
      });
      $effect(() => {
        if (this.#selection && favorites.loaded && !this.#server) {
          this.#delete();
        }
      });
    });
  }

  /** Активный сервер (модель карточки из избранного) или null (реактивно). */
  get server() {
    return this.#server;
  }

  /** Сервер выбран, но избранное ещё не загружено: данных о нём пока нет. */
  get loading() {
    return this.#selection !== null && !favorites.loaded;
  }

  /** Сделать сервер активным. */
  select(server) {
    if (!this.#ownerId) return;
    this.#selection = {ownerId: this.#ownerId, serverId: server.id};
    localStorage.setItem(ACTIVE_SERVER_KEY, JSON.stringify(this.#selection));
  }

  #delete() {
    this.#selection = null;
    localStorage.removeItem(ACTIVE_SERVER_KEY);
  }
}

/** Сохранённый выбор; из прежнего формата (снимок сервера) берётся id, мусор читается как «не выбран». */
function read() {
  try {
    const selection = JSON.parse(localStorage.getItem(ACTIVE_SERVER_KEY));
    const serverId = selection?.serverId ?? selection?.server?.id;
    return serverId != null ? {ownerId: selection.ownerId, serverId} : null;
  } catch {
    return null;
  }
}

export const activeServer = new ActiveServer();
