import {api} from '$lib/scripts/api/api.config.js';
import {errorMessage} from '$lib/scripts/service/server.bid.service.js';

/**
 * Служебная информация о приложении (GET /info/* в web-api).
 * Версии сборок: web-app вшивается на сборке (vite.config.js), web-api отдаёт GET /info/version.
 * Форма обеих: {commit, tag, version, buildTime}.
 */
class InfoService {
  /* global __APP_VERSION__ */
  appVersion = __APP_VERSION__;

  async fetchApiVersion() {
    const res = await api.get('/info/version');
    if (!res.ok) throw new Error(await errorMessage(res));
    return res.json();
  }
}

export const infoService = new InfoService();
