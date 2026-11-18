import {browser} from '$app/env';
import {token} from '#api/token.svelte.js';
import {favoriteServers} from '#scripts/favoriteServers.svelte.js';
import {buildUserFromToken} from '#util/user.mapper.js';
import {notifications} from "#scripts/notifications.svelte.js";
import {untrack} from "svelte";
import {createDiffChecker} from "#util/diff.util.js";
import {host} from "#util/gameServer.mapper.js";

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
    return `${ownerId || '*'}:${server?.id ?? '*'}:${host(server, 'API') ?? '*'}`;
  });

  constructor() {
    if (!browser) return;

    window.activeServer = this;
    this.#selection = read();

    // Выбор в другой вкладке: событие storage приходит только в остальные вкладки.
    window.addEventListener('storage', (event) => {
      if (event.key === ACTIVE_SERVER_KEY || event.key === null) {
        this.#selection = read();
      }
    });

    $effect.root(() => {
      // Очистка #selection (+ localStorage)
      $inspect('serverId:', this.server?.id);
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
        if (!favoriteServers.loaded || !this.#selection) return;

        untrack(() => {
          const server = favoriteServers.servers.find((s) => this.isActive(s.id)) ?? null;
          this.#setServer(server);
        })
      });

      // Уведомления и установка #selection при первой загрузке страницы
      $effect(() => {
        // Ждем, пока загрузится избранное
        if (!favoriteServers.loaded || favoriteServers.empty || this.#server) return;

        // Читаем зависимости через untrack, чтобы контролировать срабатывание
        untrack(() => {
          if (this.#selection) {
            return;
          }

          if (favoriteServers.servers.length === 1) {
            const server = favoriteServers.servers[0];
            notifications.info('Установлен активный сервер: ' + server.name);
            this.select(server);
            return;
          }

          if (favoriteServers.servers.length > 1) {
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
    return this.#selection !== null && !favoriteServers.loaded;
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
    return favoriteServers.loaded &&
        !favoriteServers.has(this.#selection.serverId) &&
        !favoriteServers.isPendingRemove(this.#selection.serverId);
  }

  #delete() {
    this.#selection = null;
    this.#setServer(null);
    localStorage.removeItem(ACTIVE_SERVER_KEY);
  }

  #setServer(server) {
    if (!this.#isServerChanged(this.#ownerId, server)) return;
    this.#server = server;
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
