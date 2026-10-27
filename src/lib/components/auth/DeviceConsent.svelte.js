import {auth} from '$scripts/auth.svelte.js';
import {GRANT_LINKED_TO_ANOTHER_PROFILE, oauthApi} from '$api/oauth.api.js';

/**
 * Device-Consent-Flow (DCF) — подтверждающая сторона device-flow (RFC 8628, §5.3–5.4):
 * загружает, что подтверждает пользователь, и отправляет его решение. Экземпляр — на
 * компонент DeviceConsent. AAD-токен в grant-запросы подставляет api-клиент.
 */
export class DeviceConsentFlow {
  info = $state(null);     // DeviceAuthorizationInfo — что подтверждаем (панель согласия)
  busy = $state(false);    // запрос в полёте (загрузка info / отправка решения)
  done = $state(null);     // 'approved' | 'denied' | null — итог
  failed = $state(false);  // ошибка последнего действия
  linkedToAnotherProfile = $state(false); // игрок привязан к другому профилю — подтвердить нельзя

  #userCode;

  constructor(userCode) {
    this.#userCode = userCode;
  }

  /** Загрузить, что подтверждаем. No-op без кода/без авторизации или если уже загружено. */
  async resolve() {
    if (!this.#userCode || !auth.isAuthenticated || this.info || this.done) {
      return;
    }

    this.busy = true;
    this.failed = false;
    try {
      // USER можно было бы аппрувить автоматически — сейчас всегда показываем панель.
      this.info = await oauthApi.grantInfo(this.#userCode);
    } catch (error) {
      this.failed = true;
      console.error('Device-flow resolve failed:', error);
    } finally {
      this.busy = false;
    }
  }

  /** Решение пользователя из панели согласия: ALLOW/DENY. */
  async decide(allow) {
    this.busy = true;
    this.failed = false;
    try {
      await oauthApi.grantDecision(allow ? 'ALLOW' : 'DENY', this.#userCode);
      this.done = allow ? 'approved' : 'denied';
    } catch (error) {
      this.linkedToAnotherProfile = error.message === GRANT_LINKED_TO_ANOTHER_PROFILE;
      this.failed = true;
      console.error('Device-flow decision failed:', error);
    } finally {
      this.busy = false;
    }
  }
}
