import {api, apiConfig} from '$lib/scripts/api/client.js';

/** OAuth 2.0 Device Flow (RFC 8628): запрашивающая сторона и сторона подтверждения. */
export const oauthApi = {
  /** §3.1: POST /auth/oauth/authorize, form-urlencoded, без авторизации. */
  async authorize(clientId, scope, authorizationDetails) {
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
  },

  /**
   * §3.4: один опрос token-эндпоинта. Возвращает дискриминированный результат, не бросает
   * на штатные сигналы цикла; исключение — только на сетевых ошибках. `credentials: 'include'`
   * — для refresh-куки.
   * @returns {Promise<{status: 'authorized'|'pending'|'slow_down'|'denied'|'expired'|'error', tokens?: object, error?: string}>}
   */
  async pollToken(deviceCode, clientId) {
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

    return parseStatus(data.error);
  },

  /** Подтверждающая сторона: что подтверждаем (DeviceAuthorizationInfo), AAD-доступ. */
  async grantInfo(userCode) {
    const res = await api.get(`/auth/oauth/grant?user_code=${encodeURIComponent(userCode)}`);
    const data = await res.json().catch(() => ({}));

    if (!res.ok || data.error) {
      throw new Error(data.error || 'device_grant_info_failed');
    }

    return data;
  },

  /** Подтверждающая сторона: решение ALLOW/DENY. */
  async grantDecision(decision, userCode) {
    const res = await api.post('/auth/oauth/grant', {
      body: JSON.stringify({decision, userCode}),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'device_grant_failed');
    }
  }
};

function parseStatus(error) {
  switch (error) {
    case 'authorization_pending':
      return {status: 'pending'};
    case 'slow_down':
      return {status: 'slow_down'};
    case 'access_denied':
      return {status: 'denied'};
    case 'expired_token':
      return {status: 'expired'};
    default:
      // server_error и любые неожиданные/пустые коды — терминальная ошибка. Главное —
      // ВСЕГДА вернуть объект: иначе `result.status` у undefined бросит в цикле поллинга.
      return {status: 'error', error: error || 'device_token_failed'};
  }
}
