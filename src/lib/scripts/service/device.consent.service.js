import {api} from '$lib/scripts/api/api.config.js';
import {authStore} from '$lib/scripts/store/auth.store.svelte.js';
import {createDeviceConsentStore} from '$lib/scripts/store/device.consent.store.svelte.js';

/**
 * Сервис Device-Consent-Flow (DCF) — логика подтверждающей стороны (RFC 8628, §5.3–5.4)
 * поверх {@link createDeviceConsentStore}. Без рун: только читает/пишет реактивный стор.
 * AAD-токен в grant-запросы подставляет api-клиент из authStore.
 * @param {ReturnType<typeof createDeviceConsentStore>} store
 */
export function createDeviceConsentService(store) {
  /**
   * Разобрать `user_code`: загрузить DeviceAuthorizationInfo и показать панель согласия.
   * No-op без кода/без авторизации или если уже разобрали.
   * @param {string} userCode
   */
  async function resolveConsent(userCode) {
    if (!userCode || !authStore.isAuthenticated() || store.info || store.done) {
      return;
    }

    store.approvingCode = userCode;
    store.busy = true;
    store.failed = false;
    try {
      // USER можно было бы аппрувить автоматически — сейчас всегда показываем панель.
      store.info = await grantInfo(userCode);
    } catch (error) {
      store.failed = true;
      console.error('Device-flow resolve failed:', error);
    } finally {
      store.busy = false;
    }
  }

  /**
   * Решение пользователя из панели согласия: ALLOW/DENY (§5.4).
   * @param {boolean} allow
   */
  async function decideConsent(allow) {
    store.busy = true;
    store.failed = false;
    try {
      await grantDecision(allow ? 'ALLOW' : 'DENY', store.approvingCode);
      store.done = allow ? 'approved' : 'denied';
    } catch (error) {
      store.failed = true;
      console.error('Device-flow decision failed:', error);
    } finally {
      store.busy = false;
    }
  }

  /** §5.3: GET /auth/oauth/grant?user_code=... (AAD access). */
  async function grantInfo(userCode) {
    const res = await api.get(`/auth/oauth/grant?user_code=${encodeURIComponent(userCode)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new Error(data.error || 'device_grant_info_failed');
    }

    return data;
  }

  /** §5.4: POST /auth/oauth/grant `{decision, userCode}` (AAD access). */
  async function grantDecision(decision, userCode) {
    const res = await api.post('/auth/oauth/grant', {
      body: JSON.stringify({decision, userCode}),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'device_grant_failed');
    }

    return true;
  }

  return {
    get info() { return store.info; },
    get busy() { return store.busy; },
    get done() { return store.done; },
    get failed() { return store.failed; },
    resolveConsent,
    decideConsent,
  };
}

/** Собрать DCF: стор + сервис. Создаётся через `authService.createDeviceConsent()`. */
export function createDeviceConsentFlow() {
  return createDeviceConsentService(createDeviceConsentStore());
}
