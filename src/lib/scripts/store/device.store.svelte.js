/**
 * Стор device-flow (RFC 8628) — единственный источник реактивного состояния обеих
 * сторон потока. Бизнес-логики и обращений к API не содержит (это в device.service).
 *
 * Две независимые секции:
 *  - consent  — подтверждающая сторона (носитель AAD одобряет вход устройства, §5.3–5.4);
 *  - request  — запрашивающая сторона (устройство показывает user_code и поллит, §5.1–5.2).
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

const DEFAULT_INTERVAL = 5; // RFC 8628 §3.5 — дефолтный интервал поллинга, сек

class DeviceStore {
  // --- Consent (подтверждающая сторона) ---
  approvingCode = $state('');  // user_code, который разбираем/подтверждаем
  info = $state(null);         // DeviceAuthorizationInfo — что подтверждаем (панель)
  consentBusy = $state(false); // запрос в полёте (загрузка info / отправка решения)
  consentDone = $state(null);  // 'approved' | 'denied' | null — итог
  consentFailed = $state(false); // ошибка последнего действия

  // --- Request (запрашивающая сторона) ---
  pollStatus = $state(POLL_STATUS.IDLE);
  userCode = $state('');                  // показываемый код
  verificationUri = $state('');
  verificationUriComplete = $state('');
  interval = $state(DEFAULT_INTERVAL);
  pollError = $state(null);

  /** Сбросить секцию подтверждения в исходное. */
  resetConsent() {
    this.approvingCode = '';
    this.info = null;
    this.consentBusy = false;
    this.consentDone = null;
    this.consentFailed = false;
  }

  /** Сбросить секцию запроса/поллинга в исходное. */
  resetRequest() {
    this.pollStatus = POLL_STATUS.IDLE;
    this.userCode = '';
    this.verificationUri = '';
    this.verificationUriComplete = '';
    this.interval = DEFAULT_INTERVAL;
    this.pollError = null;
  }
}

export const deviceStore = new DeviceStore();
