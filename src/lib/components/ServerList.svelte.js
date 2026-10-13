import {serversApi} from '$lib/scripts/api/servers.api.js';
import {notifications} from '$lib/scripts/notifications.svelte.js';
import {createDebounce} from '$lib/scripts/util/utils.js';

/**
 * Поиск по листингу серверов. Пустой запрос — исходный список (из SSR `load`), иначе —
 * результат поиска с задержкой ввода. Устаревшие запросы отменяются, их ответы отбрасываются.
 */
export class ServerSearch {
  servers = $state([]);
  loading = $state(false);

  #query = $state('');
  #initial;
  #debounce = createDebounce((query, signal) => serversApi.search(query, signal), 300);

  constructor(initial) {
    this.#initial = initial;
    this.servers = initial;
  }

  get query() {
    return this.#query;
  }

  set query(query) {
    this.#query = query;

    if (!query.trim()) {
      this.#debounce.cancel();
      this.loading = false;
      this.servers = this.#initial;
      return;
    }

    this.loading = true;
    this.#debounce.run(query)
        .then((servers) => {
          if (this.#query !== query) return;
          this.servers = servers;
          this.loading = false;
        })
        .catch((e) => {
          // Отменённый устаревший запрос (ввод продолжился) — не ошибка
          if (e.name === 'AbortError' || this.#query !== query) return;
          this.loading = false;
          notifications.error('Не удалось выполнить поиск');
        });
  }
}
