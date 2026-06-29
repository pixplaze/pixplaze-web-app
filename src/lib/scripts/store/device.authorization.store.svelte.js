/**
 * Стор Device-Authorization-Flow (DAF) — реактивное состояние запрашивающей стороны
 * device-flow (RFC 8628, §5.1–5.2). Per-instance (фабрика), без логики и API.
 * Логика — в `device.authorization.service.js`.
 */

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
export const DEFAULT_INTERVAL = 5;

/**
 * @param {{scope?: string, authorizationDetails?: object, onAuthorized?: Function}} [config]
 *   Конфиг флоу — фиксируется на создании и живёт ровно столько, сколько стор.
 */
export function createDeviceAuthorizationStore({scope, authorizationDetails, onAuthorized} = {}) {
  const store = $state({
    // --- Реактивное состояние для UI ---
    pollStatus: POLL_STATUS.IDLE,
    userCode: '',
    verificationUri: '',
    verificationUriComplete: '',
    interval: DEFAULT_INTERVAL,
    error: null,

    // --- Конфиг флоу (неизменен в течение жизни флоу) ---
    scope,
    authorizationDetails,
    onAuthorized,
  });
  return store;
}
