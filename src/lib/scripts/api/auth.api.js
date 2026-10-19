import {api, apiConfig} from '$lib/scripts/api/client.js';

/**
 * Вход, регистрация, выход и обновление access-токена. Ответы входа, регистрации и refresh —
 * сессия `{accessToken, permissions}`: токен и подсказка с правами для интерфейса.
 * @typedef {{accessToken: string, permissions: {system: string[], servers: Record<string, string[]>}}} Session
 */
export const authApi = {
  /** @returns {Promise<Session|null>} сессия или null, если сервер отказал */
  async signIn(signInData) {
    return sessionOf(await api.post('/auth/sign-in', {body: JSON.stringify(signInData)}));
  },

  /** @returns {Promise<Session|null>} сессия или null, если сервер отказал */
  async signUp(signUpData) {
    return sessionOf(await api.post('/auth/sign-up', {body: JSON.stringify(signUpData)}));
  },

  async signOut() {
    await api.post('/auth/sign-out');
  },

  /**
   * Обновить access-токен по refresh-куке. Мимо ApiClient: на 401 он сам зовёт refresh.
   * @returns {Promise<Session|null>} новая сессия или null, если сервер отказал
   * @throws {TypeError} при сетевой ошибке (сервер недоступен)
   */
  async refresh() {
    const res = await fetch(`${apiConfig.url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Обязательно для отправки куки
    });
    return sessionOf(res);
  }
};

async function sessionOf(res) {
  if (!res.ok) {
    return null;
  }
  const data = await res.json().catch(() => ({}));
  return data.accessToken ? data : null;
}
