import {token} from '$lib/scripts/api/token.svelte.js';
import {oauthApi} from '$lib/scripts/api/oauth.api.js';
import {randomUUID} from '$lib/scripts/util/utils.js';

/** Стадии поллинга запрашивающей стороны (для UI). */
export const POLL_STATUS = {
  IDLE: 'idle',             // ещё не стартовали
  STARTING: 'starting',     // запрашиваем user_code (POST authorize)
  PENDING: 'pending',       // показываем user_code, ждём подтверждения
  AUTHORIZED: 'authorized', // токены получены
  DENIED: 'denied',         // пользователь отклонил
  EXPIRED: 'expired',       // device_code истёк
  ERROR: 'error',           // неожиданная ошибка (сеть/server_error)
};

/** RFC 8628 §3.5 — дефолтный интервал поллинга, сек. */
const DEFAULT_INTERVAL = 5;
/** RFC 8628 §3.5 — на сколько увеличивать interval при slow_down. */
const SLOW_DOWN_STEP = 5;

/**
 * Device-Authorization-Flow (DAF) — запрашивающая сторона device-flow (RFC 8628, §5.1–5.2):
 * получает user_code и поллит token-эндпоинт до выдачи токенов. Экземпляр — на компонент
 * DeviceAuthorization. `onAuthorized` зовётся ИМПЕРАТИВНО в момент прихода токенов —
 * поэтому срабатывает, даже если владелец размонтируется фактом авторизации.
 */
export class DeviceAuthorizationFlow {
  pollStatus = $state(POLL_STATUS.IDLE);
  userCode = $state('');
  verificationUri = $state('');
  verificationUriComplete = $state('');
  interval = $state(DEFAULT_INTERVAL);
  error = $state(null);

  #scope;
  #authorizationDetails;
  #onAuthorized;
  #deviceCode = '';
  #clientId = '';
  #timer = null;
  #stopped = false;

  /** @param {{scope?: string, authorizationDetails?: object, onAuthorized?: Function}} [config] */
  constructor({scope, authorizationDetails, onAuthorized} = {}) {
    this.#scope = scope;
    this.#authorizationDetails = authorizationDetails;
    this.#onAuthorized = onAuthorized;
  }

  /** Старт: запросить user_code и запустить цикл поллинга. */
  async start() {
    this.#stopped = false;
    clearTimeout(this.#timer);
    this.pollStatus = POLL_STATUS.STARTING;
    this.error = null;
    this.interval = DEFAULT_INTERVAL;
    this.userCode = '';
    this.verificationUri = '';
    this.verificationUriComplete = '';
    this.#clientId = randomUUID();

    let auth;
    try {
      auth = await oauthApi.authorize(this.#clientId, this.#scope, this.#authorizationDetails);
    } catch (error) {
      if (this.#stopped) return;
      this.pollStatus = POLL_STATUS.ERROR;
      this.error = error.message;
      return;
    }

    if (this.#stopped) return;

    this.#deviceCode = auth.device_code;
    this.userCode = auth.user_code;
    this.verificationUri = auth.verification_uri;
    this.verificationUriComplete = auth.verification_uri_complete;
    this.interval = auth.interval || this.interval;
    this.pollStatus = POLL_STATUS.PENDING;
    this.#scheduleTick();
  }

  /** Остановить цикл (вызывать при размонтировании владельца). */
  stop() {
    this.#stopped = true;
    clearTimeout(this.#timer);
  }

  /** Перезапуск после expired/denied/error. */
  restart() {
    this.stop();
    return this.start();
  }

  #scheduleTick() {
    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.#tick(), this.interval * 1000);
  }

  /** Один цикл поллинга token-эндпоинта. */
  async #tick() {
    if (this.#stopped) return;

    let result;
    try {
      result = await oauthApi.pollToken(this.#deviceCode, this.#clientId);
    } catch (error) {
      if (this.#stopped) return;
      this.pollStatus = POLL_STATUS.ERROR;
      this.error = error.message;
      return;
    }

    if (this.#stopped) return;

    switch (result.status) {
      case 'authorized':
        // Токены выданы: access — в стор; refresh — в HttpOnly-куке (выставил сервер).
        if (result.tokens?.access_token) {
          token.set(result.tokens.access_token);
        }
        this.pollStatus = POLL_STATUS.AUTHORIZED;
        // Императивно, синхронно — до Svelte-flush'а и возможного размонтирования владельца.
        this.#onAuthorized?.();
        return;
      case 'pending':
        this.#scheduleTick();
        return;
      case 'slow_down':
        this.interval += SLOW_DOWN_STEP;
        this.#scheduleTick();
        return;
      case 'denied':
        this.pollStatus = POLL_STATUS.DENIED;
        return;
      case 'expired':
        this.pollStatus = POLL_STATUS.EXPIRED;
        return;
      default: // 'error', 'server_error', неизвестное — терминально, без throw.
        this.pollStatus = POLL_STATUS.ERROR;
        this.error = result.error ?? 'device_token_failed';
    }
  }
}
