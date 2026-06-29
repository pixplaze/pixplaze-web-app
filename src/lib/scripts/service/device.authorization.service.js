import {apiConfig} from '$lib/scripts/api/api.config.js';
import {authStore} from '$lib/scripts/store/auth.store.svelte.js';
import {randomUUID} from '$lib/scripts/util/utils.js';
import {
  POLL_STATUS,
  DEFAULT_INTERVAL,
  createDeviceAuthorizationStore,
} from '$lib/scripts/store/device.authorization.store.svelte.js';

// Реэкспорт, чтобы UI импортировал POLL_STATUS из сервисного слоя.
export {POLL_STATUS};

const SLOW_DOWN_STEP = 5; // RFC 8628 §3.5 — на сколько увеличивать interval при slow_down

/**
 * Сервис Device-Authorization-Flow (DAF) — логика запрашивающей стороны (RFC 8628,
 * §5.1–5.2) поверх {@link createDeviceAuthorizationStore}. Без рун: читает/пишет
 * реактивный стор; транзиентные внутренности цикла (deviceCode/clientId/timer/stopped)
 * держит в замыкании (не реактивны, не конфиг).
 *
 * `onAuthorized` берётся из стора (конфиг флоу) и зовётся ИМПЕРАТИВНО в момент прихода
 * токенов — поэтому срабатывает даже если владелец размонтируется фактом авторизации.
 * @param {ReturnType<typeof createDeviceAuthorizationStore>} store
 */
export function createDeviceAuthorizationService(store) {
  let deviceCode = '';
  let clientId = '';
  let timer = null;
  let stopped = false;

  function scheduleTick() {
    clearTimeout(timer);
    timer = setTimeout(tick, store.interval * 1000);
  }

  /** Один цикл поллинга token-эндпоинта. */
  async function tick() {
    if (stopped) {
      return;
    }

    let result;
    try {
      result = await pollToken(deviceCode, clientId);
    } catch (error) {
      if (stopped) {
        return;
      }
      store.pollStatus = POLL_STATUS.ERROR;
      store.error = error.message;
      return;
    }

    if (stopped) {
      return;
    }

    switch (result.status) {
      case 'authorized':
        // Токены выданы: access — в стор; refresh — в HttpOnly-куке (выставил сервер).
        if (result.tokens?.access_token) {
          authStore.setAccessToken(result.tokens.access_token);
        }
        store.pollStatus = POLL_STATUS.AUTHORIZED;
        // Императивно, синхронно — до Svelte-flush'а и возможного размонтирования владельца.
        store.onAuthorized?.();
        return;
      case 'pending':
        scheduleTick();
        return;
      case 'slow_down':
        store.interval += SLOW_DOWN_STEP;
        scheduleTick();
        return;
      case 'denied':
        store.pollStatus = POLL_STATUS.DENIED;
        return;
      case 'expired':
        store.pollStatus = POLL_STATUS.EXPIRED;
        return;
    }
  }

  /** Старт: запросить user_code и запустить цикл поллинга. */
  async function startLogin() {
    stopped = false;
    clearTimeout(timer);
    store.pollStatus = POLL_STATUS.STARTING;
    store.error = null;
    store.interval = DEFAULT_INTERVAL;
    store.userCode = '';
    store.verificationUri = '';
    store.verificationUriComplete = '';
    clientId = randomUUID();

    let auth;
    try {
      auth = await authorize(clientId, store.scope, store.authorizationDetails);
    } catch (error) {
      if (stopped) {
        return;
      }
      store.pollStatus = POLL_STATUS.ERROR;
      store.error = error.message;
      return;
    }

    if (stopped) {
      return;
    }

    deviceCode = auth.device_code;
    store.userCode = auth.user_code;
    store.verificationUri = auth.verification_uri;
    store.verificationUriComplete = auth.verification_uri_complete;
    store.interval = auth.interval || store.interval;
    store.pollStatus = POLL_STATUS.PENDING;
    scheduleTick();
  }

  /** Остановить цикл (вызывать при размонтировании владельца). */
  function stopLogin() {
    stopped = true;
    clearTimeout(timer);
  }

  /** Перезапуск после expired/denied/error (конфиг — из стора). */
  function restartLogin() {
    stopLogin();
    return startLogin();
  }

  /** §5.1 (RFC 8628 §3.1): POST /auth/oauth/authorize, form-urlencoded, без авторизации. */
  async function authorize(clientId, scope, authorizationDetails) {
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
   * §5.2 (RFC 8628 §3.4): один опрос token-эндпоинта. Возвращает дискриминированный
   * результат, не бросает на штатные сигналы цикла; исключение — только на неожиданных
   * ошибках. `credentials: 'include'` — для refresh-куки.
   * @returns {Promise<{status: 'authorized'|'pending'|'slow_down'|'denied'|'expired', tokens?: object}>}
   */
  async function pollToken(deviceCode, clientId) {
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

  return {
    get pollStatus() { return store.pollStatus; },
    get userCode() { return store.userCode; },
    get verificationUri() { return store.verificationUri; },
    get verificationUriComplete() { return store.verificationUriComplete; },
    get interval() { return store.interval; },
    get error() { return store.error; },
    startLogin,
    stopLogin,
    restartLogin,
  };
}

/**
 * Собрать DAF: стор (с конфигом флоу) + сервис. Создаётся через
 * `authService.createDeviceAuthorization(config)`.
 * @param {{scope?: string, authorizationDetails?: object, onAuthorized?: Function}} [config]
 */
export function createDeviceAuthorizationFlow(config) {
  return createDeviceAuthorizationService(createDeviceAuthorizationStore(config));
}
