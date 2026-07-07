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
    this.authorizedEventSubscribers = [];
    // this.unauthorizedEventSubscribers = [];
    //
    this.addAuthorizedEventHandler((token) => authStore.setAccessToken(token))

    // Регистрируем обработку 401 в низкоуровневом клиенте
    api.setUnauthorizedHandler(() => this.handleUnauthorized());
  }

  /**
   * Вызывается клиентом при ответе 401. Возвращает новый access-токен,
   * по которому исходный запрос будет повторён.
   */
  async handleUnauthorized() {
    // Если обновление уже идёт — ждём его результата
    if (this.isRefreshing) {
      return this.addRefreshedEventHandler(token => token);
    }

    this.isRefreshing = true;

    try {
      const newAccessToken = await this.refresh();
      this.isRefreshing = false;
      this.#handleAuthorizedEvent(newAccessToken);
      this.#handleRefreshedEvent(newAccessToken);
      return newAccessToken;
    } catch (refreshError) {
      this.isRefreshing = false;
      this.#rejectRefreshedEvent(refreshError);
      await this.signOut();
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
    if (res.ok && data.accessToken) {
      this.#handleAuthorizedEvent(data.accessToken);
    }
    return data.accessToken;
  }

  async signUp(signUpData) {
    const res = await api.post('/auth/sign-up', {
      body: JSON.stringify(signUpData),
    });
    const data = await res.json();
    if (res.ok && data.accessToken) {
      this.#handleAuthorizedEvent(data.accessToken);
    }
    return data.accessToken;
  }

  async signOut() {
    await api.post('/auth/sign-out');
    authStore.clearAccessToken();
    // this.#handleUnauthorizedEvent();
  }

  async refresh() {
    const res = await fetch(`${apiConfig.url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Обязательно для отправки куки
    });

    if (!res.ok) throw new Error('Refresh session failed');

    const data = await res.json();
    if (res.ok && data.accessToken) {
      // this.#handleAuthorizedEvent(data.accessToken);
    }
    return data.accessToken;
  }

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

  #handleAuthorizedEvent(token) {
    this.authorizedEventSubscribers.forEach(handler => handler(token));
  }

  addAuthorizedEventHandler(onAuthorized) {
    if (this.authorizedEventSubscribers.indexOf(onAuthorized) !== -1) {
      return;
    }

    this.authorizedEventSubscribers.push(onAuthorized);
  }
  //
  // #handleUnauthorizedEvent() {
  //   this.unauthorizedEventSubscribers.forEach(handler => handler());
  // }
  //
  // addUnauthorizedEventHandler(onUnauthorized) {
  //   if (this.unauthorizedEventSubscribers.indexOf(onUnauthorized) !== -1) {
  //     return;
  //   }
  //
  //   this.unauthorizedEventSubscribers.push(onUnauthorized);
  // }

  // Подписка на завершение обновления токена
  addRefreshedEventHandler(onRefreshed) {
    return new Promise((resolve, reject) => {
      this.refreshSubscribers.push({ resolve, reject });
    }).then(onRefreshed);
  }

  #handleRefreshedEvent(token) {
    this.refreshSubscribers.forEach(({ resolve }) => resolve(token));
    this.refreshSubscribers = [];
  }

  #rejectRefreshedEvent(error) {
    this.refreshSubscribers.forEach(({ reject }) => reject(error));
    this.refreshSubscribers = [];
  }
}

export const authService = new AuthService();