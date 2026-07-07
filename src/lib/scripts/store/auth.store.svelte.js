import {browser} from "$app/environment";

/**
 * Стор авторизации — единственный источник реактивного состояния токена.
 * Не содержит бизнес-логики и работы с API.
 */
class AuthStore {
  accessToken = $state('');

  constructor() {
    this.accessToken = browser ? localStorage.getItem('accessToken') : '' || '';
  }

  getAccessToken() {
    return this.accessToken || browser ? localStorage.getItem('accessToken') : '';
  }

  setAccessToken(accessToken) {
    if (!browser) {
      return;
    }

    localStorage.setItem('accessToken', accessToken);
    this.accessToken = accessToken;
  }

  clearAccessToken() {
    if (!browser) {
      return;
    }
    localStorage.removeItem('accessToken');
    this.accessToken = '';
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const authStore = new AuthStore();