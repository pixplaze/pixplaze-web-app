import {browser} from '$app/environment';
import {token} from '$lib/scripts/api/token.svelte.js';
import {buildUserFromToken} from '$lib/scripts/util/user.mapper.js';

const ACTIVE_SERVER_KEY = 'activeServer';

/**
 * Активный сервер — тот, с которым работают карта, консоль и чат. Хранится снимок сервера
 * (а не только id), чтобы страницы знали сервер сразу после перезагрузки, не дожидаясь
 * избранного. Выбор принадлежит пользователю: при выходе или входе другим аккаунтом сбрасывается.
 */
class ActiveServer {
  /** @type {{ownerId: *, server: object} | null} */
  #selection = $state(null);
  #ownerId = $derived(buildUserFromToken(token.value)?.id ?? null);

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
          this.#save(null);
        }
      });
    });
  }

  /** Снимок активного сервера или null, если сервер не выбран (реактивно). */
  get server() {
    return this.#selection?.server ?? null;
  }

  /** Сделать сервер активным (модель карточки, {@link mapServer}). */
  select(server) {
    if (!this.#ownerId) return;
    const {id, name, host, hosts, image} = server;
    this.#save({ownerId: this.#ownerId, server: {id, name, host, hosts, image}});
  }

  /**
   * Сверить с загруженным избранным: снимок обновляется свежими данными, а если сервера
   * в избранном больше нет (убран в другой вкладке или на другом устройстве) — выбор сбрасывается.
   */
  refresh(servers) {
    if (!this.server) return;
    const fresh = servers.find(s => s.id === this.server.id);
    if (fresh) {
      this.select(fresh);
    } else {
      this.#save(null);
    }
  }

  /** Сбросить выбор, если активен сервер `serverId`. */
  clear(serverId) {
    if (this.#selection?.server.id === serverId) {
      this.#save(null);
    }
  }

  #save(selection) {
    this.#selection = selection;
    if (selection) {
      localStorage.setItem(ACTIVE_SERVER_KEY, JSON.stringify(selection));
    } else {
      localStorage.removeItem(ACTIVE_SERVER_KEY);
    }
  }
}

function read() {
  try {
    return JSON.parse(localStorage.getItem(ACTIVE_SERVER_KEY));
  } catch {
    return null;
  }
}

export const activeServer = new ActiveServer();
