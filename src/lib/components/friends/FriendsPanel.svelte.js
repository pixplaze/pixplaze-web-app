import {friendsApi} from '$api/friends.api.js';
import {notifications} from '$scripts/notifications.svelte.js';
import {friends} from '$scripts/friends.svelte.js';
import {createDebounce} from '$util/debounce.util.js';

/** Короче web-api не ищет. */
export const SEARCH_MIN_LENGTH = 2;

/**
 * Друзья: найти и добавить, ответить на заявку, убрать; кто из взаимных друзей в сети и где.
 * Онлайн видят только взаимные друзья. Поиск — по началу имени профиля или ника игрока, с задержкой
 * ввода; устаревшие запросы отменяются, их ответы отбрасываются.
 */
export class FriendsPanel {
  failed = $state(false);
  /** @type {import('$api/friends.api.js').FoundProfile[]} */
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
    return friends.online;
  }

  get incoming() {
    return friends.incoming;
  }

  get outgoing() {
    return friends.outgoing;
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
      await friends.load(this.#profileId);
    } catch {
      this.failed = true;
    }
  }

  /** @returns {Promise<boolean>} добавлен ли */
  async add(name) {
    const added = await friends.add(name);
    // Статус в выдаче поиска изменился
    if (added) this.#search(this.#query);
    return added;
  }

  remove(friend) {
    return friends.remove(friend);
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
