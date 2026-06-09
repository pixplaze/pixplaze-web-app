class AuthStore {
  accessToken = $state('');

  constructor() {
    this.accessToken = localStorage.getItem('accessToken');
  }

  getAccessToken() {
    return this.accessToken || localStorage.getItem('accessToken');
  }

  setAccessToken(accessToken) {
    localStorage.setItem('accessToken', accessToken);
    this.accessToken = accessToken;
  }

  isAuthenticated() {
    return !!this.getAccessToken();
  }
}

export const authStore = new AuthStore();