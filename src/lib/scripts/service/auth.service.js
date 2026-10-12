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
   * Вызывается клиентом при ответе 401. Возвращает новый access-токен, по которому
   * исходный запрос будет повторён, или null — тогда клиент отдаёт исходный ответ 401.
   * Отказ сервера в refresh (сессия истекла/отозвана) — выход; сетевая ошибка — токен
   * не трогаем, следующий запрос попробует обновить его снова.
   */
  async handleUnauthorized() {
    // Если обновление уже идёт — ждём его результата
    if (this.isRefreshing) {
      return this.addRefreshedEventHandler();
    }

    this.isRefreshing = true;
    let newAccessToken = null;

    try {
      newAccessToken = await this.refresh();
      if (newAccessToken) {
        this.#handleAuthorizedEvent(newAccessToken);
      } else {
        await this.signOut();
      }
    } catch {
      // Сеть недоступна: сессию не завершаем
    } finally {
      this.isRefreshing = false;
      this.#handleRefreshedEvent(newAccessToken);
    }

    return newAccessToken;
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
    try {
      await api.post('/auth/sign-out');
    } catch {
      // Сервер недоступен — локально выходим всё равно
    } finally {
      authStore.clearAccessToken();
    }
  }

  /**
   * Обновить access-токен по refresh-куке.
   * @returns {Promise<string|null>} новый токен или null, если сервер отказал
   * @throws {TypeError} при сетевой ошибке (сервер недоступен)
   */
  async refresh() {
    const res = await fetch(`${apiConfig.url}/auth/refresh`, {
      method: 'POST',
      credentials: 'include', // Обязательно для отправки куки
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json().catch(() => ({}));
    return data.accessToken || null;
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

  // Подписка на завершение обновления токена: резолвится новым токеном или null
  addRefreshedEventHandler() {
    return new Promise(resolve => this.refreshSubscribers.push(resolve));
  }

  #handleRefreshedEvent(token) {
    this.refreshSubscribers.forEach(resolve => resolve(token));
    this.refreshSubscribers = [];
  }
}

export const authService = new AuthService();