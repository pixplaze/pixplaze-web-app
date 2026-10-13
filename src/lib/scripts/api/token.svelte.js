import {browser} from '$app/environment';

const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * Хранилище access-токена: состояние + localStorage + синхронизация вкладок. Лежит в api/,
 * потому что его читает ApiClient (слой ниже областей); область auth им пользуется.
 */
class Token {
  #value = $state('');

  constructor() {
    if (!browser) {
      return;
    }
    this.#value = localStorage.getItem(ACCESS_TOKEN_KEY) || '';

    // Вход/выход в другой вкладке: событие storage приходит только в остальные вкладки.
    window.addEventListener('storage', (event) => {
      if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
        this.#value = event.newValue || '';
      }
    });
  }

  /** Текущий токен или '' (реактивно). */
  get value() {
    return this.#value;
  }

  set(accessToken) {
    if (!browser) {
      return;
    }
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    this.#value = accessToken;
  }

  clear() {
    if (!browser) {
      return;
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.#value = '';
  }
}

export const token = new Token();
