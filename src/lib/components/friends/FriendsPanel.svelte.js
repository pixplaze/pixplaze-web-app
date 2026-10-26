import {friendsApi} from '$lib/scripts/api/friends.api.js';
import {notifications} from '$lib/scripts/notifications.svelte.js';
import {presence} from '$lib/scripts/presence.svelte.js';
import {createDebounce} from '$lib/scripts/util/utils.js';

/** Короче web-api не ищет. */
export const SEARCH_MIN_LENGTH = 2;

/**
 * Друзья: найти и добавить, ответить на заявку, убрать; кто из взаимных друзей в сети и где.
 * Онлайн видят только взаимные друзья. Поиск — по началу имени профиля или ника игрока, с задержкой
 * ввода; устаревшие запросы отменяются, их ответы отбрасываются.
 */
export class FriendsPanel {
  friends = $state([]);
  failed = $state(false);
  /** @type {import('$lib/scripts/api/friends.api.js').FoundProfile[]} */
  found = $state([]);
  searching = $state(false);

  #profileId;
  #query = $state('');
  #debounce = createDebounce((query, signal) => friendsApi.search(query, signal), 300);

  constructor(profileId) {
    this.#profileId = profileId;
  }

  /** Взаимные друзья с игроками в сети и временем выхода (без самого профиля). */
  get online() {
    return presence.friends;
  }

  get incoming() {
    return this.friends.filter(friend => friend.status === 'INCOMING');
  }

  get outgoing() {
    return this.friends.filter(friend => friend.status === 'OUTGOING');
  }

  get query() {
    return this.#query;
  }

  set query(query) {
    this.#query = query;
    this.#search(query);
  }

  async load() {
    this.failed = false;
    try {
      const [friends] = await Promise.all([friendsApi.list(), presence.load(this.#profileId)]);
      this.friends = friends;
    } catch {
      this.failed = true;
    }
  }

  /** @returns {Promise<boolean>} добавлен ли */
  async add(name) {
    try {
      await friendsApi.add(name.trim());
      await this.load();
      // Статус в выдаче поиска изменился
      this.#search(this.#query);
      return true;
    } catch (error) {
      notifications.error(`Не удалось добавить в друзья: ${error.message}`);
      return false;
    }
  }

  async remove(friend) {
    try {
      await friendsApi.remove(friend.profileId);
      await this.load();
    } catch (error) {
      notifications.error(`Не удалось убрать из друзей: ${error.message}`);
    }
  }

  #search(query) {
    if (query.trim().length < SEARCH_MIN_LENGTH) {
      this.#debounce.cancel();
      this.searching = false;
      this.found = [];
      return;
    }

    this.searching = true;
    this.#debounce.run(query)
        .then((found) => {
          if (this.#query !== query) return;
          this.found = found;
          this.searching = false;
        })
        .catch((e) => {
          // Отменённый устаревший запрос (ввод продолжился) — не ошибка
          if (e.name === 'AbortError' || this.#query !== query) return;
          this.searching = false;
          notifications.error('Не удалось найти профили');
        });
  }
}
