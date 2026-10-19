import {api} from '$lib/scripts/api/client.js';

/** Каталог прав web-api (GET /auth/permissions): имя константы → код права. */
export const permissionsApi = {
  /**
   * Каталог с условным запросом: `version` — сохранённый ETag. Каталог не изменился — `{notModified: true}`.
   * @returns {Promise<{notModified: true} | {version: string, permissions: Record<string, string>}>}
   */
  async fetchCatalog(version) {
    const res = await api.get('/auth/permissions', {headers: version ? {'If-None-Match': version} : {}});
    if (res.status === 304) {
      return {notModified: true};
    }
    return {version: res.headers.get('ETag'), permissions: await api.json(res)};
  }
};
