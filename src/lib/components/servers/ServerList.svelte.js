import {serversApi} from '#api/servers.api.js';
import {notifications} from '#scripts/notifications.svelte.js';
import {createDebounce} from '#util/debounce.util.js';
import {createPoller} from "#util/poller.util.js";

/**
 * Поиск по листингу серверов. Пустой запрос — исходный список (из SSR `load`), иначе —
 * результат поиска с задержкой ввода. Устаревшие запросы отменяются, их ответы отбрасываются.
 */
export class ServerList {
  servers = $state([]);
  loading = $state(false);

  #query = $state('');
  #initial;
  #debouncedSearchQuery = createDebounce((query, signal) => serversApi.search(query, signal), 300);
  poller = createPoller({
    request: async (signal) => {
      this.servers = await serversApi.search(this.query, signal);
    },
    period: 5000,
    onGaveUp: () => notifications.error('Не удалось обновить список серверов!')
  });

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
      this.#debouncedSearchQuery.cancel();
      this.loading = false;
      this.servers = this.#initial;
      return;
    }

    this.loading = true;
    this.#debouncedSearchQuery.run(query)
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
