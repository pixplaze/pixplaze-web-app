import {browser} from '$app/environment';
import {token} from '$api/token.svelte.js';
import {favorites} from '$scripts/favorites.svelte.js';
import {buildUserFromToken} from '$util/user.mapper.js';
import {notifications} from "$scripts/notifications.svelte.js";
import {untrack} from "svelte";
import {createDiffChecker} from "$util/diff.util.js";
import {host} from "$util/server.mapper.js";

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
  #server = $state(null);
  #isServerChanged = createDiffChecker((ownerId, server) => {
    const diff = `${ownerId || '*'}:${server?.id ?? '*'}:${host(server, 'API') ?? '*'}`;
    console.log(diff);
    return diff;
  });

  constructor() {
    if (!browser) {
      return;
    }
    window.activeServer = this;
    this.#selection = read();

    // Выбор в другой вкладке: событие storage приходит только в остальные вкладки.
    window.addEventListener('storage', (event) => {
      if (event.key === ACTIVE_SERVER_KEY || event.key === null) {
        this.#selection = read();
      }
    });

    $effect.root(() => {
      $effect(() => {
        $inspect('selected:', this.#selection);
      })

      $effect(() => {
        $inspect('active:', this.#server);
      });

      // Очистка #selection (+ localStorage)
      $effect(() => {
        if (
            this.#selection && (!this.#isSelectionOwner() || this.#isSelectionDeleted())
        ) {
          this.#delete();
        }
      });

      // Установка #server
      $effect(() => {
        // Эффект сработает автоматически при изменении selection или массива серверов
        if (!favorites.loaded) return;

        this.#selection; // Чтобы зависило от изменения #selection

        untrack(() => {
          const server = favorites.servers.find(s => this.isActive(s.id)) ?? null;
          this.#setServer(server);
        })
      });

      // Уведомления и установка #selection
      $effect(() => {
        // Ждем, пока загрузится избранное
        if (!favorites.loaded || favorites.empty || this.#server) return;

        // favorites.servers;

        // Читаем зависимости через untrack, чтобы контролировать срабатывание
        untrack(() => {
          if (this.#selection) {
            return;
          }

          if (favorites.servers.length === 1) {
            const server = favorites.servers[0];
            notifications.info('Установлен активный сервер: ' + server.name);
            this.select(server);
            return;
          }

          if (favorites.servers.length > 1) {
            notifications.warning('Не удалось определить активный сервер, в избранном больше одного сервера!');
          }
        });
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

  isActive(target) {
    // 1. Проверяем, передан ли объект и есть ли у него внутри serverId
    if (target && typeof target === 'object' && 'id' in target) {
      return target.id === this.#selection?.serverId ?? false;
    }

    // 2. Иначе трактуем аргумент как прямой serverId (строку или число)
    return target === this.#selection?.serverId ?? false;
  }

  /** Сделать сервер активным. */
  select(server) {
    if (!this.#ownerId) return;
    this.#selection = {ownerId: this.#ownerId, serverId: server.id};
    localStorage.setItem(ACTIVE_SERVER_KEY, JSON.stringify(this.#selection));
  }

  #isSelectionOwner() {
    return this.#selection.ownerId === this.#ownerId;
  }

  #isSelectionDeleted() {
    return !favorites.has(this.#selection.serverId) && !favorites.isPendingRemove(this.#selection.serverId);
  }

  #delete() {
    this.#selection = null;
    localStorage.removeItem(ACTIVE_SERVER_KEY);
  }

  #setServer(server) {
    if (this.#isServerChanged(this.#ownerId, server)) {
      this.#server = server;
    }
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
