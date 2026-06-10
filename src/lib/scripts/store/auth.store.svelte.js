/**
 * Стор авторизации — единственный источник реактивного состояния токена.
 * Не содержит бизнес-логики и работы с API.
 */
class AuthStore {
  accessToken = $state('');

  constructor() {
    this.accessToken = localStorage.getItem('accessToken') || '';
  }

  getAccessToken() {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  setAccessToken(accessToken) {
    localStorage.setItem('accessToken', accessToken);
    this.accessToken = accessToken;
  }

  clearAccessToken() {
    localStorage.removeItem('accessToken');
    this.accessToken = '';
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const authStore = new AuthStore();