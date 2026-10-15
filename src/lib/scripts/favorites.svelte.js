import {browser} from '$app/environment';
import {untrack} from 'svelte';
import {SvelteSet} from 'svelte/reactivity';
import {token} from '$lib/scripts/api/token.svelte.js';
import {favoritesApi} from '$lib/scripts/api/favorites.api.js';
import {buildUserFromToken} from '$lib/scripts/util/user.mapper.js';
import {activeServer} from '$lib/scripts/activeServer.svelte.js';
import {notifications} from '$lib/scripts/notifications.svelte.js';
import {createLatest} from '$lib/scripts/util/latest.util.js';

/** Сколько строка ждёт отмены, прежде чем сервер уйдёт из избранного. */
export const UNDO_DELAY = 5000;

/**
 * Избранные серверы текущего пользователя. Загружаются при входе (и смене аккаунта),
 * перечитываются по {@link load}. Удаление из списка отложенное: сервер ждёт {@link UNDO_DELAY},
 * его можно вернуть {@link undo}; запрос уходит по истечении задержки.
 */
class Favorites {
  #servers = $state([]);
  #loading = $state(false);
  #error = $state(null);
  /** id серверов, ожидающих удаления. */
  #pendingRemove = new SvelteSet();
  #timers = new Map();
  #latest = createLatest();
  #userId = $derived(buildUserFromToken(token.value)?.id ?? null);

  constructor() {
    if (!browser) {
      return;
    }
    $effect.root(() => {
      // Обновление токена того же пользователя список не перечитывает: следим за id
      $effect(() => {
        const userId = this.#userId;
        untrack(() => this.#onUser(userId));
      });
    });
  }

  /** Избранные серверы, включая ожидающие удаления. */
  get servers() {
    return this.#servers;
  }

  get loading() {
    return this.#loading;
  }

  /** Сообщение последней неудачной загрузки или null. */
  get error() {
    return this.#error;
  }

  /** В избранном ли сервер; ожидающий удаления — уже нет. */
  has(serverId) {
    return !this.#pendingRemove.has(serverId) && this.#servers.some(s => s.id === serverId);
  }

  /** Ожидает ли сервер удаления (можно {@link undo}). */
  isPendingRemove(serverId) {
    return this.#pendingRemove.has(serverId);
  }

  async load() {
    const isLatest = this.#latest.next();
    this.#loading = true;
    this.#error = null;
    try {
      const servers = await favoritesApi.fetchMine();
      if (!isLatest()) return;
      this.#servers = servers;
      // Адреса сервера могли измениться — снимок активного обновляем вместе со списком
      activeServer.refresh(servers);
    } catch (e) {
      if (isLatest()) this.#error = e.message;
    } finally {
      if (isLatest()) this.#loading = false;
    }
  }

  /** Добавить сервер (модель карточки); ожидающий удаления — просто вернуть. */
  async add(server) {
    if (this.isPendingRemove(server.id)) {
      this.undo(server.id);
      return;
    }
    if (this.has(server.id)) return;

    this.#servers = [...this.#servers, server];
    try {
      await favoritesApi.add(server.id);
    } catch {
      this.#drop(server.id);
      notifications.error('Не удалось добавить сервер в избранное');
    }
  }

  /** Убрать сервер сразу, без отмены. */
  async remove(serverId) {
    this.undo(serverId);
    const index = this.#servers.findIndex(s => s.id === serverId);
    if (index < 0) return;

    const server = this.#servers[index];
    this.#drop(serverId);
    activeServer.clear(serverId);
    try {
      await favoritesApi.remove(serverId);
    } catch {
      // Возвращаем на прежнее место, если перечитанный за это время список его уже не вернул
      if (!this.#servers.some(s => s.id === serverId)) {
        this.#servers = this.#servers.toSpliced(index, 0, server);
      }
      notifications.error('Не удалось убрать сервер из избранного');
    }
  }

  /** Убрать сервер через {@link UNDO_DELAY}; до этого его можно вернуть {@link undo}. */
  removeLater(serverId) {
    if (this.#pendingRemove.has(serverId)) return;
    this.#pendingRemove.add(serverId);
    this.#timers.set(serverId, setTimeout(() => this.remove(serverId), UNDO_DELAY));
  }

  /** Отменить отложенное удаление. */
  undo(serverId) {
    clearTimeout(this.#timers.get(serverId));
    this.#timers.delete(serverId);
    this.#pendingRemove.delete(serverId);
  }

  #drop(serverId) {
    this.#servers = this.#servers.filter(s => s.id !== serverId);
  }

  #onUser(userId) {
    // Выход или другой аккаунт: отложенные удаления прежнего пользователя не отправляем
    for (const serverId of [...this.#pendingRemove]) this.undo(serverId);
    this.#latest.invalidate();
    this.#servers = [];
    this.#error = null;
    this.#loading = false;
    if (userId) this.load();
  }
}

export const favorites = new Favorites();
