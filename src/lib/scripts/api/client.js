import {env} from '$env/dynamic/public';
import {token} from '$lib/scripts/api/token.svelte.js';

// URL API читается из окружения в РАНТАЙМЕ (adapter-node), а не инлайнится на сборке —
// поэтому образ деплоится как есть, а URL задаётся через docker-compose `environment`
// (или `.env` в dev). Фолбэк — локальная разработка.
// ВАЖНО: по этому URL ходит БРАУЗЕР клиента, значит в проде он должен быть публично
// доступен (не `localhost`) и с настроенным CORS (см. credentials: 'include' ниже).
export const apiConfig = {
  url: env.PUBLIC_PIXPLAZE_WEB_API_URL || 'http://localhost:8080',
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

  /**
   * @param {string} endpoint путь относительно {@link baseUrl}
   * @param {RequestInit & {fetch?: typeof fetch}} [options] `fetch` — реализация запроса,
   *        например `fetch` из `load` SvelteKit: ответ SSR переиспользуется при гидрации
   */
  async request(endpoint, {fetch: doFetch = fetch, ...options} = {}) {
    const url = `${this.baseUrl}${endpoint}`;

    // Добавляем заголовки по умолчанию
    options.headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Если есть токен, добавляем его в Authorization
    const accessToken = token.value;
    if (accessToken) {
      options.headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Важно для работы с HttpOnly Cookie (Refresh Token)
    options.credentials = 'include';

    const response = await doFetch(url, options);

    // Обработка 401 (Токен истёк) — делегируем разрешение токена сервису
    if (
      response.status === 401 &&
      !options._retry &&
      endpoint !== '/auth/sign-in' &&
      endpoint !== '/auth/sign-out' &&
      this.unauthorizedHandler
    ) {
      options._retry = true;
      const newAccessToken = await this.unauthorizedHandler();

      if (newAccessToken) {
        // Повторяем исходный запрос с новым токеном
        options.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return await doFetch(url, options);
      }
    }

    return response;
  }

  /**
   * Тело успешного ответа как JSON.
   * @throws {Error} при `!res.ok` — с сообщением из ErrorResponse API
   */
  async json(res) {
    await this.ensureOk(res);
    return res.json();
  }

  /**
   * Проверка ответа без тела (POST-действия и т.п.).
   * @throws {Error} при `!res.ok` — с сообщением из ErrorResponse API
   */
  async ensureOk(res) {
    if (!res.ok) {
      throw new Error(await errorMessage(res));
    }
    return res;
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

/** Сообщение из ErrorResponse API; если тело не JSON — сам текст, если пусто — статус. */
async function errorMessage(res) {
  const text = await res.text();
  try {
    return JSON.parse(text).message ?? text;
  } catch {
    return text || `HTTP ${res.status}`;
  }
}

// Экспортируем экземпляр (Singleton)
export const api = new ApiClient(apiConfig.url);