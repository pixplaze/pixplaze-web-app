/**
 * Стор device-flow (RFC 8628) — реактивное состояние подтверждения входа стороннего
 * устройства. Хранит только `user_code`, который нужно зааппрувить, и стадию процесса.
 * Бизнес-логики и обращений к API не содержит.
 *
 * `user_code` переживает перезагрузку и редирект между формами входа/регистрации
 * (его кладёт неавторизованный пользователь, а аппрувит уже после входа), поэтому
 * держим его в sessionStorage — в рамках вкладки, без утечки в соседние сессии.
 */
const PENDING_USER_CODE_KEY = 'deviceUserCode';

/** Стадия подтверждения для UI. */
export const DEVICE_STATUS = {
  IDLE: 'idle',
  LOADING: 'loading',       // загружаем DeviceAuthorizationInfo (GET grant)
  CONSENT: 'consent',       // ждём явного решения пользователя (тип != USER)
  APPROVING: 'approving',
  APPROVED: 'approved',
  DENYING: 'denying',
  DENIED: 'denied',
  FAILED: 'failed',
};

class DeviceStore {
  // user_code, ожидающий подтверждения (из ?userCode=... адресной строки).
  pendingUserCode = $state('');
  // Текущая стадия подтверждения (см. DEVICE_STATUS).
  status = $state(DEVICE_STATUS.IDLE);
  // DeviceAuthorizationInfo от GET /auth/oauth/grant (что именно подтверждаем).
  info = $state(null);

  constructor() {
    this.pendingUserCode = sessionStorage.getItem(PENDING_USER_CODE_KEY) || '';
  }

  setPendingUserCode(userCode) {
    sessionStorage.setItem(PENDING_USER_CODE_KEY, userCode);
    this.pendingUserCode = userCode;
  }

  clearPendingUserCode() {
    sessionStorage.removeItem(PENDING_USER_CODE_KEY);
    this.pendingUserCode = '';
  }
}

export const deviceStore = new DeviceStore();