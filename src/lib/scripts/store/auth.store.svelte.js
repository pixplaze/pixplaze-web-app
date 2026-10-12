import {browser} from "$app/environment";

const ACCESS_TOKEN_KEY = 'accessToken';

/**
 * Стор авторизации — единственный источник реактивного состояния токена.
 * Не содержит бизнес-логики и работы с API.
 */
class AuthStore {
  accessToken = $state('');

  constructor() {
    if (!browser) {
      return;
    }
    this.accessToken = localStorage.getItem(ACCESS_TOKEN_KEY) || '';

    // Вход/выход в другой вкладке: событие storage приходит только в остальные вкладки.
    window.addEventListener('storage', (event) => {
      if (event.key === ACCESS_TOKEN_KEY || event.key === null) {
        this.accessToken = event.newValue || '';
      }
    });
  }

  getAccessToken() {
    return this.accessToken;
  }

  setAccessToken(accessToken) {
    if (!browser) {
      return;
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    this.accessToken = accessToken;
  }

  clearAccessToken() {
    if (!browser) {
      return;
    }
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    this.accessToken = '';
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const authStore = new AuthStore();