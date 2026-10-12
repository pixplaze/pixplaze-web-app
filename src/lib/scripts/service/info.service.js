import {api} from '$lib/scripts/api/api.config.js';

/**
 * Служебная информация о приложении (GET /info/* в web-api).
 * Версии сборок: web-app вшивается на сборке (vite.config.js), web-api отдаёт GET /info/version.
 * Форма обеих: {commit, tag, version, buildTime}.
 */
class InfoService {
  /* global __APP_VERSION__ */
  appVersion = __APP_VERSION__;

  async fetchApiVersion() {
    return api.json(await api.get('/info/version'));
  }
}

export const infoService = new InfoService();
