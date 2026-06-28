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

  /** Авторизован ли пользователь (read-only, реактивно через authStore). */
  get isAuthenticated() {
    return authStore.isAuthenticated();
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
    // Навигацию не делаем здесь: очистка токена сама уведёт на /auth/sign-in
    // через реактивный guard в корневом +layout.svelte.
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

  /**
   * Запросить, что именно подтверждаем — шаг §5.3 гайда:
   * GET /auth/oauth/grant?user_code=..., авторизуясь AAD access-токеном.
   * Возвращает универсальный `DeviceAuthorizationInfo` (type/status/source/targets/
   * permissions/details). Протухший/неизвестный код → тело `{"error": ...}` (бросаем).
   * @param {string} userCode
   * @returns {Promise<object>} DeviceAuthorizationInfo
   */
  async getGrantInfo(userCode) {
    const res = await api.get(`/auth/oauth/grant?user_code=${encodeURIComponent(userCode)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new Error(data.error || 'device_grant_info_failed');
    }

    return data;
  }

  /**
   * Отклонить (DENY) device-flow по `user_code` — §5.4 гайда. Симметрично approve:
   * POST /auth/oauth/grant с `{decision: "DENY", userCode}`.
   * @param {string} userCode
   * @returns {Promise<boolean>}
   */
  async deny(userCode) {
    const res = await api.post('/auth/oauth/grant', {
      body: JSON.stringify({decision: 'DENY', userCode}),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'device_grant_failed');
    }

    return true;
  }

  /**
   * Подтвердить (ALLOW) device-flow по `user_code` — шаг §5.4 гайда:
   * POST /auth/oauth/grant, авторизуясь AAD access-токеном (его добавляет api-клиент
   * из стора). Тело — JSON `{decision, userCode}`. Ответ `200 true`; иначе бросаем
   * ошибку с кодом из тела (`{"error": ...}`), напр. `expired_token`/`access_denied`.
   * @param {string} userCode короткий код из ?userCode=... адресной строки.
   * @returns {Promise<boolean>} true при успешном подтверждении.
   */
  async approve(userCode) {
    const res = await api.post('/auth/oauth/grant', {
      body: JSON.stringify({decision: 'ALLOW', userCode}),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'device_grant_failed');
    }

    return true;
  }
}

export const authService = new AuthService();