import {api, apiConfig} from '$lib/scripts/api/client.js';

/** Вход, регистрация, выход и обновление access-токена. */
export const authApi = {
  /** @returns {Promise<string|null>} access-токен или null, если сервер отказал */
  async signIn(signInData) {
    return accessTokenOf(await api.post('/auth/sign-in', {body: JSON.stringify(signInData)}));
  },

  /** @returns {Promise<string|null>} access-токен или null, если сервер отказал */
  async signUp(signUpData) {
    return accessTokenOf(await api.post('/auth/sign-up', {body: JSON.stringify(signUpData)}));
  },

  async signOut() {
    await api.post('/auth/sign-out');
  },

  /**
   * Обновить access-токен по refresh-куке. Мимо ApiClient: на 401 он сам зовёт refresh.
   * @returns {Promise<string|null>} новый токен или null, если сервер отказал
   * @throws {TypeError} при сетевой ошибке (сервер недоступен)
   */
  async refresh() {
    const res = await fetch(`${apiConfig.url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Обязательно для отправки куки
    });
    return accessTokenOf(res);
  }
};

async function accessTokenOf(res) {
  if (!res.ok) {
    return null;
  }
  const data = await res.json().catch(() => ({}));
  return data.accessToken || null;
}
