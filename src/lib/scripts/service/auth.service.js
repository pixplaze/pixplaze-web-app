import {api, apiConfig} from '$lib/scripts/api/api.config.js';
import {authStore} from '$lib/scripts/store/auth.store.svelte.js';

/**
 * Сервис авторизации: бизнес-логика, обращения к API и управление стором.
 * Также инкапсулирует очередь refresh-запросов, чтобы при истечении токена
 * не запускать обновление параллельно для каждого ожидающего запроса.
 */
class AuthService {
  constructor() {
    // Состояние процесса обновления токена
    this.isRefreshing = false;
    this.refreshSubscribers = [];

    // Регистрируем обработку 401 в низкоуровневом клиенте
    api.setUnauthorizedHandler(() => this.handleUnauthorized());
  }

  // Подписка на завершение обновления токена
  subscribeTokenRefresh(cb) {
    this.refreshSubscribers.push(cb);
  }

  // Уведомление всех ожидающих запросов о новом токене
  onTokenRefreshed(token) {
    this.refreshSubscribers.forEach((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  /**
   * Вызывается клиентом при ответе 401. Возвращает новый access-токен,
   * по которому исходный запрос будет повторён.
   */
  async handleUnauthorized() {
    // Если обновление уже идёт — ждём его результата
    if (this.isRefreshing) {
      return new Promise((resolve) => this.subscribeTokenRefresh(resolve));
    }

    this.isRefreshing = true;

    try {
      const newAccessToken = await this.refresh();
      this.isRefreshing = false;
      this.onTokenRefreshed(newAccessToken);
      return newAccessToken;
    } catch (refreshError) {
      console.error(refreshError);
      this.isRefreshing = false;
      await this.signOut(); // Если рефреш не удался — выходим
      throw refreshError;
    }
  }

  async signIn(signInData) {
    const res = await api.post('/auth/sign-in', {
      body: JSON.stringify(signInData),
    });
    const data = await res.json();
    if (res.ok && data.accessToken) authStore.setAccessToken(data.accessToken);
    return data.accessToken;
  }

  async signUp(signUpData) {
    const res = await api.post('/auth/sign-up', {
      body: JSON.stringify(signUpData),
    });
    const data = await res.json();
    if (res.ok && data.accessToken) authStore.setAccessToken(data.accessToken);
    return data.accessToken;
  }

  async signOut() {
    await api.post('/auth/sign-out');
    authStore.clearAccessToken();
    // Редирект на страницу логина
    window.location.href = '/auth/sign-in';
  }

  async refresh() {
    const res = await fetch(`${apiConfig.url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Обязательно для отправки куки
    });

    if (!res.ok) throw new Error('Refresh session failed');

    const data = await res.json();
    authStore.setAccessToken(data.accessToken);
    return data.accessToken;
  }
}

export const authService = new AuthService();