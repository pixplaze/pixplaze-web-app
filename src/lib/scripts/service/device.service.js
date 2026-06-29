import {api, apiConfig} from '$lib/scripts/api/api.config.js';
import {authStore} from '$lib/scripts/store/auth.store.svelte.js';
import {POLL_STATUS, deviceStore} from '$lib/scripts/store/device.store.svelte.js';
import {randomUUID} from '$lib/scripts/util/utils.js';

const SLOW_DOWN_STEP = 5; // RFC 8628 §3.5 — на сколько увеличивать interval при slow_down

/**
 * Сервис device-flow (RFC 8628): device-API обеих сторон + оркестрация поверх
 * {@link deviceStore}. Используется не напрямую, а через фасад {@link authService}
 * (`authService.device`). AAD-токен в grant-запросы подставляет api-клиент из authStore,
 * поэтому в authService этот сервис не нуждается (нет цикла зависимостей).
 */
class DeviceService {
  // Непубличные значения цикла поллинга (реактивность не нужна).
  #deviceCode = '';
  #clientId = '';
  #timer = null;
  #stopped = false;

  // --- Read-only проекция стора для UI ---
  get info() { return deviceStore.info; }
  get consentBusy() { return deviceStore.consentBusy; }
  get consentDone() { return deviceStore.consentDone; }
  get consentFailed() { return deviceStore.consentFailed; }

  get pollStatus() { return deviceStore.pollStatus; }
  get userCode() { return deviceStore.userCode; }
  get verificationUri() { return deviceStore.verificationUri; }
  get verificationUriComplete() { return deviceStore.verificationUriComplete; }
  get pollError() { return deviceStore.pollError; }

  // ============================================================
  //  Подтверждающая сторона (consent, §5.3–5.4)
  // ============================================================

  /**
   * Разобрать `userCode`: загрузить DeviceAuthorizationInfo и развести по типу субъекта.
   * USER (вход самого устройства приложения) — аппрувим автоматически; иначе показываем
   * панель согласия. No-op без кода/без авторизации или если уже разобрали.
   * @param {string} userCode
   */
  async resolveConsent(userCode) {
    console.log("resolving consent");
    if (!userCode || !authStore.isAuthenticated() || deviceStore.info || deviceStore.consentDone) {
      console.log("consent failed!");
      return;
    }

    deviceStore.approvingCode = userCode;
    deviceStore.consentBusy = true;
    deviceStore.consentFailed = false;
    try {
      const grant = await this.#grantInfo(userCode);
      // if (grant.type === 'USER') {
      //   await this.#grantDecision('ALLOW', userCode);
      //   deviceStore.consentDone = 'approved';
      // } else {
        deviceStore.info = grant;
      // }
    } catch (error) {
      deviceStore.consentFailed = true;
      console.error('Device-flow resolve failed:', error);
    } finally {
      deviceStore.consentBusy = false;
    }
  }

  /**
   * Решение пользователя из панели согласия: ALLOW/DENY (§5.4).
   * @param {boolean} allow
   */
  async decideConsent(allow) {
    deviceStore.consentBusy = true;
    deviceStore.consentFailed = false;
    try {
      await this.#grantDecision(allow ? 'ALLOW' : 'DENY', deviceStore.approvingCode);
      deviceStore.consentDone = allow ? 'approved' : 'denied';
    } catch (error) {
      deviceStore.consentFailed = true;
      console.error('Device-flow decision failed:', error);
    } finally {
      deviceStore.consentBusy = false;
    }
  }

  /**
   * Запросить, что именно подтверждаем — §5.3: GET /auth/oauth/grant?user_code=...,
   * авторизуясь AAD access-токеном (его добавляет api-клиент). Протухший/неизвестный
   * код → тело `{"error": ...}` (бросаем).
   */
  async #grantInfo(userCode) {
    const res = await api.get(`/auth/oauth/grant?user_code=${encodeURIComponent(userCode)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new Error(data.error || 'device_grant_info_failed');
    }

    return data;
  }

  /**
   * Подтвердить/отклонить — §5.4: POST /auth/oauth/grant с `{decision, userCode}`,
   * авторизуясь AAD access-токеном. Ответ `200 true`.
   */
  async #grantDecision(decision, userCode) {
    const res = await api.post('/auth/oauth/grant', {
      body: JSON.stringify({decision, userCode}),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'device_grant_failed');
    }

    return true;
  }

  // ============================================================
  //  Запрашивающая сторона (request + polling, §5.1–5.2)
  // ============================================================

  /**
   * Старт device-flow на запрашивающей стороне: запросить user_code и запустить цикл
   * поллинга. Пустой `scope` ⇒ `AAD:USER` (вход устройства приложения).
   * @param {{scope?: string, authorizationDetails?: object}} [options]
   */
  async startLogin({scope, authorizationDetails} = {}) {
    this.#stopped = false;
    clearTimeout(this.#timer);
    deviceStore.resetRequest();
    deviceStore.pollStatus = POLL_STATUS.STARTING;
    this.#clientId = randomUUID();

    let auth;
    try {
      auth = await this.#authorize({clientId: this.#clientId, scope, authorizationDetails});
    } catch (error) {
      if (this.#stopped) {
        return;
      }
      deviceStore.pollStatus = POLL_STATUS.ERROR;
      deviceStore.pollError = error.message;
      return;
    }

    if (this.#stopped) {
      return;
    }

    this.#deviceCode = auth.device_code;
    deviceStore.userCode = auth.user_code;
    deviceStore.verificationUri = auth.verification_uri;
    deviceStore.verificationUriComplete = auth.verification_uri_complete;
    deviceStore.interval = auth.interval || deviceStore.interval;
    deviceStore.pollStatus = POLL_STATUS.PENDING;
    this.#scheduleTick();
  }

  /** Остановить цикл поллинга (вызывать при размонтировании страницы). */
  stopLogin() {
    this.#stopped = true;
    clearTimeout(this.#timer);
  }

  /** Перезапуск после expired/denied/error. */
  restartLogin(options) {
    this.stopLogin();
    return this.startLogin(options);
  }

  #scheduleTick() {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#tick(), deviceStore.interval * 1000);
  }

  /** Один цикл поллинга token-эндпоинта. */
  async #tick() {
    if (this.#stopped) {
      return;
    }

    let result;
    try {
      result = await this.#pollToken({deviceCode: this.#deviceCode, clientId: this.#clientId});
    } catch (error) {
      if (this.#stopped) {
        return;
      }
      deviceStore.pollStatus = POLL_STATUS.ERROR;
      deviceStore.pollError = error.message;
      return;
    }

    if (this.#stopped) {
      return;
    }

    switch (result.status) {
      case 'authorized':
        // Токены выданы: access — в стор; refresh — в HttpOnly-куке (выставил сервер).
        if (result.tokens?.access_token) {
          authStore.setAccessToken(result.tokens.access_token);
        }
        deviceStore.pollStatus = POLL_STATUS.AUTHORIZED;
        return; // поллинг завершён
      case 'pending':
        this.#scheduleTick();
        return;
      case 'slow_down':
        deviceStore.interval += SLOW_DOWN_STEP;
        this.#scheduleTick();
        return;
      case 'denied':
        deviceStore.pollStatus = POLL_STATUS.DENIED;
        return;
      case 'expired':
        deviceStore.pollStatus = POLL_STATUS.EXPIRED;
        return;
    }
  }

  /**
   * Старт device-flow — §5.1 (RFC 8628 §3.1): POST /auth/oauth/authorize,
   * `application/x-www-form-urlencoded`, без авторизации. Пустой `scope` ⇒ `AAD:USER`.
   */
  async #authorize({clientId, scope, authorizationDetails}) {
    const body = new URLSearchParams();
    body.set('client_id', clientId);
    if (scope) {
      body.set('scope', scope);
    }
    if (authorizationDetails) {
      body.set('authorization_details', JSON.stringify(authorizationDetails));
    }

    const res = await fetch(`${apiConfig.url}/auth/oauth/authorize`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      body: body.toString(),
    });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new Error(data.error || 'device_authorization_failed');
    }

    return data;
  }

  /**
   * Один опрос token-эндпоинта — §5.2 (RFC 8628 §3.4). Возвращает дискриминированный
   * результат, а НЕ бросает на штатные сигналы цикла (`authorization_pending`/`slow_down`).
   * Исключение — только на неожиданных ошибках. `credentials: 'include'` — чтобы сервер
   * мог выставить refresh-куку при успехе.
   * @returns {Promise<{status: 'authorized'|'pending'|'slow_down'|'denied'|'expired', tokens?: object}>}
   */
  async #pollToken({deviceCode, clientId}) {
    const body = new URLSearchParams();
    body.set('grant_type', 'urn:ietf:params:oauth:grant-type:device_code');
    body.set('client_id', clientId);
    body.set('device_code', deviceCode);

    const res = await fetch(`${apiConfig.url}/auth/oauth/token`, {
      method: 'POST',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      credentials: 'include',
      body: body.toString(),
    });
    const data = await res.json().catch(() => ({}));

    if (res.ok && data.access_token) {
      return {status: 'authorized', tokens: data};
    }

    switch (data.error) {
      case 'authorization_pending':
        return {status: 'pending'};
      case 'slow_down':
        return {status: 'slow_down'};
      case 'access_denied':
        return {status: 'denied'};
      case 'expired_token':
        return {status: 'expired'};
      default:
        throw new Error(data.error || 'device_token_failed');
    }
  }
}

export const deviceService = new DeviceService();
