// import {env} from '$env/static/public'
import {authStore} from '$lib/scripts/store/auth.store.svelte.js';

export const apiConfig = {
  // url: `${env.PUBLIC_PIXPLAZE_WEB_API_URL}`
  // url: `http://192.168.1.100:8080`
  url: `http://localhost:8080`
}

/**
 * Низкоуровневый HTTP-клиент: конфигурация URL и утилитные обёртки над fetch.
 * Состояние авторизации берётся из стора, а бизнес-логика обработки 401
 * (refresh/sign-out) делегируется внешнему обработчику, регистрируемому
 * через {@link setUnauthorizedHandler}. Так конфиг не зависит от слоя сервисов.
 */
class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    // Обработчик ответа 401, внедряется auth.service
    this.unauthorizedHandler = null;
  }

  setUnauthorizedHandler(handler) {
    this.unauthorizedHandler = handler;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Добавляем заголовки по умолчанию
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Если есть токен, добавляем его в Authorization
    const accessToken = authStore.getAccessToken();
    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Важно для работы с HttpOnly Cookie (Refresh Token)
    options.credentials = 'include';

    const response = await fetch(url, options);

    // Обработка 401 (Токен истёк) — делегируем разрешение токена сервису
    if (
      response.status === 401 &&
      !options._retry &&
      endpoint !== '/auth/sign-in' &&
      this.unauthorizedHandler
    ) {
      options._retry = true;
      const newAccessToken = await this.unauthorizedHandler();

      if (newAccessToken) {
        // Повторяем исходный запрос с новым токеном
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return await fetch(url, options);
      }
    }

    return response;
  }

  async get(endpoint, options = {}) {
    return await this.request(endpoint, {method: 'GET', ...options})
  }

  async post(endpoint, options = {}) {
    return await this.request(endpoint, {method: 'POST', ...options})
  }

  async put(endpoint, options = {}) {
    return await this.request(endpoint, {method: 'PUT', ...options})
  }

  async delete(endpoint, options = {}) {
    return await this.request(endpoint, {method: 'DELETE', ...options})
  }
}

// Экспортируем экземпляр (Singleton)
export const api = new ApiClient(apiConfig.url);