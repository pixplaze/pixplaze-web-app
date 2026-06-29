import {api, apiConfig} from '$lib/scripts/api/api.config.js';
import {authStore} from '$lib/scripts/store/auth.store.svelte.js';
import {createDeviceConsentFlow} from '$lib/scripts/service/device.consent.service.js';
import {createDeviceAuthorizationFlow} from '$lib/scripts/service/device.authorization.service.js';

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

  // --- Фабричный фасад device-flow (RFC 8628). DCF и DAF — два независимых процесса,
  //     каждый создаётся отдельным экземпляром на владельца (без синглтона). ---

  /**
   * Создать Device-Consent-Flow (DCF) — подтверждение входа стороннего устройства
   * (§5.3–5.4). Владелец — страница. Новый экземпляр на каждый вызов.
   */
  createDeviceConsent() {
    return createDeviceConsentFlow();
  }

  /**
   * Создать Device-Authorization-Flow (DAF) — запрос входа текущего устройства с
   * поллингом (§5.1–5.2). Владелец — компонент DeviceAuthorization. Новый экземпляр
   * на каждый вызов; конфиг (`scope/authorizationDetails/onAuthorized`) хранится в сторе.
   * @param {{scope?: string, authorizationDetails?: object, onAuthorized?: Function}} [config]
   */
  createDeviceAuthorization(config) {
    return createDeviceAuthorizationFlow(config);
  }
}

export const authService = new AuthService();