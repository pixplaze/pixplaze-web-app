// import {env} from '$env/static/public'

const apiConfig = {
  // url: `${env.PUBLIC_PIXPLAZE_WEB_API_URL}`
  url: `http://192.168.1.100:8080`
}

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
    this.accessToken = null;
    // Используем очередь, чтобы избежать множественных запросов на refresh
    this.isRefreshing = false;
    this.refreshSubscribers = [];
  }

  // Вспомогательный метод для подписки на обновление токена
  subscribeTokenRefresh(cb) {
    this.refreshSubscribers.push(cb);
  }

  // Уведомление всех ожидающих запросов о новом токене
  onTokenRefreshed(token) {
    this.refreshSubscribers.map((cb) => cb(token));
    this.refreshSubscribers = [];
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Добавляем заголовки по умолчанию
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Если есть токен, добавляем его в Authorization
    if (this.accessToken) {
      options.headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    // Важно для работы с HttpOnly Cookie (Refresh Token)
    options.credentials = 'include';

    let response = await fetch(url, options);

    // Обработка 401 (Токен истек)
    if (response.status === 401 && !options._retry && endpoint !== '/auth/sign-in') {
      if (this.isRefreshing) {
        // Если уже идет процесс обновления, ждем его завершения
        return new Promise((resolve) => {
          this.subscribeTokenRefresh((token) => {
            options.headers['Authorization'] = `Bearer ${token}`;
            resolve(fetch(url, options));
          });
        });
      }

      options._retry = true;
      this.isRefreshing = true;

      try {
        const newAccessToken = await this.refresh();
        this.isRefreshing = false;
        this.onTokenRefreshed(newAccessToken);

        // Повторяем исходный запрос с новым токеном
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return await fetch(url, options);
      } catch (refreshError) {
        console.error(refreshError);
        this.isRefreshing = false;
        await this.signOut(); // Если рефреш не удался — выходим
        throw refreshError;
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

  /**
   * Методы авторизации
   */

  async signIn(signInData) {
    const res = await this.request('/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(signInData),
    });
    const data = await res.json();
    if (res.ok) this.accessToken = data.accessToken;
    return data;
  }

  async signUp(signUpData) {
    const res = await this.request('/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(signUpData),
    });
    return await res.json();
  }

  async signOut() {
    await this.request('/auth/sign-out', { method: 'POST' });
    this.accessToken = null;
    // Опционально: редирект на страницу логина
    window.location.href = '/auth/sign-in';
  }

  async refresh() {
    const res = await fetch(`${this.baseUrl}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Обязательно для отправки куки
    });

    if (!res.ok) throw new Error('Refresh session failed');

    const data = await res.json();
    this.accessToken = data.accessToken;
    return data.accessToken;
  }
}

// Экспортируем экземпляр (Singleton)
export const api = new ApiClient(apiConfig.url);
