import {authService} from '$lib/scripts/service/auth.service.js';
import {DEVICE_STATUS, deviceStore} from '$lib/scripts/store/device.store.svelte.js';

/**
 * Сервис device-flow (RFC 8628) на стороне подтверждающего устройства (веб-приложение,
 * носитель AAD). Оркеструет шаг подтверждения входа стороннего устройства по `user_code`
 * из адресной строки (?userCode=...). Сырой вызов API живёт в {@link authService};
 * здесь — сценарий: аппрувить сразу для авторизованного, иначе запомнить код и
 * аппрувить после входа/регистрации.
 *
 * Пока реализован только аппрув (ALLOW). Старт флоу/поллинг/отклонение — отложены.
 */
class DeviceService {
  /** Текущая стадия подтверждения (read-only, реактивно). */
  get status() {
    return deviceStore.status;
  }

  /** DeviceAuthorizationInfo — что именно подтверждаем (read-only, реактивно). */
  get info() {
    return deviceStore.info;
  }

  /** Есть ли отложенный код, ожидающий подтверждения после входа (read-only). */
  get hasPending() {
    return !!deviceStore.pendingUserCode;
  }

  /**
   * Нужно ли явное решение пользователя: субъект — не USER (игрок/сервер). Для USER
   * (вход самого устройства приложения) подтверждаем автоматически.
   */
  get requiresConsent() {
    return !!deviceStore.info && deviceStore.info.type !== 'USER';
  }

  /**
   * Обработать `user_code` из адресной строки на странице авторизации.
   * Авторизован — разбираем запрос (тип субъекта решает: авто-аппрув или согласие);
   * не авторизован — запоминаем код до входа/регистрации ({@link resumePending}).
   * @param {string | null | undefined} userCode
   */
  async handleUserCode(userCode) {
    if (!userCode) {
      return;
    }

    if (authService.isAuthenticated) {
      return this.#resolve(userCode);
    }

    // Не авторизован: запоминаем код, ждём входа/регистрации.
    deviceStore.setPendingUserCode(userCode);
  }

  /**
   * Продолжить отложенный код после успешного входа/регистрации. No-op, если
   * отложенного кода нет или пользователь всё ещё не авторизован.
   */
  async resumePending() {
    const userCode = deviceStore.pendingUserCode;
    if (!userCode || !authService.isAuthenticated) {
      return;
    }

    return this.#resolve(userCode);
  }

  /** Решение пользователя «Разрешить» из UI согласия. */
  async allow() {
    return this.#approve(deviceStore.pendingUserCode);
  }

  /** Решение пользователя «Запретить» из UI согласия. */
  async deny() {
    const userCode = deviceStore.pendingUserCode;
    if (!userCode) {
      return;
    }

    deviceStore.status = DEVICE_STATUS.DENYING;
    try {
      const ok = await authService.deny(userCode);
      deviceStore.status = DEVICE_STATUS.DENIED;
      deviceStore.clearPendingUserCode();
      return ok;
    } catch (error) {
      deviceStore.status = DEVICE_STATUS.FAILED;
      console.error('Device-flow deny failed:', error);
      throw error;
    }
  }

  /**
   * Загрузить DeviceAuthorizationInfo и развести по типу субъекта:
   * USER → авто-аппрув (вход устройства приложения); иначе → показать запрос и ждать
   * решения пользователя (status = CONSENT).
   */
  async #resolve(userCode) {
    deviceStore.setPendingUserCode(userCode);
    deviceStore.status = DEVICE_STATUS.LOADING;

    let info;
    try {
      info = await authService.getGrantInfo(userCode);
    } catch (error) {
      deviceStore.status = DEVICE_STATUS.FAILED;
      console.error('Device-flow grant info failed:', error);
      throw error;
    }

    deviceStore.info = info;

    // USER — вход самого устройства приложения: подтверждаем автоматически.
    if (info.type === 'USER') {
      return this.#approve(userCode);
    }

    // Игрок/сервер — нужно явное согласие пользователя (см. UI согласия).
    deviceStore.status = DEVICE_STATUS.CONSENT;
  }

  /** Подтвердить код, отражая стадию в сторе и очищая отложенный код. */
  async #approve(userCode) {
    if (!userCode) {
      return;
    }

    deviceStore.status = DEVICE_STATUS.APPROVING;
    try {
      const ok = await authService.approve(userCode);
      deviceStore.status = DEVICE_STATUS.APPROVED;
      deviceStore.clearPendingUserCode();
      return ok;
    } catch (error) {
      deviceStore.status = DEVICE_STATUS.FAILED;
      // Код оставляем отложенным: вход мог быть валиден, но грант — нет (напр.
      // протухший user_code). Чистим, только если код заведомо больше не нужен.
      console.error('Device-flow approve failed:', error);
      throw error;
    }
  }
}

export const deviceService = new DeviceService();