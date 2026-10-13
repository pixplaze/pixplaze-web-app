import {api} from '$lib/scripts/api/client.js';

/** Служебная информация о web-api (GET /info/*). */
export const infoApi = {
  /** Версия сборки API: {commit, tag, version, buildTime}. */
  async fetchVersion() {
    return api.json(await api.get('/info/version'));
  }
};
