import {api} from '$api/client.js';
import {mapServer} from '$util/server.mapper.js';

/** Листинг Minecraft-серверов: модели карточек ({@link mapServer}). */
export const serversApi = {
  /**
   * Все серверы листинга.
   * @param {typeof fetch} [fetch] `fetch` из `load` SvelteKit при SSR
   */
  async list(fetch) {
    return (await api.json(await api.get('/servers', {fetch}))).map(mapServer);
  },

  /**
   * Один сервер листинга.
   * @param {typeof fetch} [fetch] `fetch` из `load` SvelteKit
   */
  async get(serverId, fetch) {
    return mapServer(await api.json(await api.get(`/servers/${serverId}`, {fetch})));
  },

  /**
   * Онлайн сервера по часам за последние `days` суток; часов без замеров в ответе нет.
   * @param {typeof fetch} [fetch] `fetch` из `load` SvelteKit
   * @returns {Promise<{hour: Date, peak: number|null, average: number|null, max: number|null, online: boolean}[]>}
   */
  async history(serverId, days = 7, fetch) {
    const points = await api.json(await api.get(`/servers/${serverId}/history?days=${days}`, {fetch}));
    return points.map(p => ({
      hour: new Date(p.hour),
      peak: p.playersPeak,
      average: p.playersAverage,
      max: p.playersMax,
      online: p.isOnline
    }));
  },

  /**
   * Поиск по листингу.
   * @param {AbortSignal} [signal] отмена устаревшего запроса при продолжении ввода
   */
  async search(query, signal) {
    const res = await api.get(`/servers?search=${encodeURIComponent(query.trim())}`, {signal});
    return (await api.json(res)).map(mapServer);
  },

  async rate(serverId, rating) {
    await api.ensureOk(await api.post(`/servers/rate/${serverId}?rating=${rating}`));
  },

  /**
   * Обмен токена профиля на токен доступа к плагину сервера.
   * @returns {Promise<{accessToken: string, expiresIn: number}>} `expiresIn` — секунды
   * @throws {PluginAccessDeniedError} 403 — у профиля на сервере нет ни одной роли
   */
  async exchangePluginToken(serverId) {
    const res = await api.post(`/servers/${serverId}/token`);
    if (res.status === 403) {
      throw new PluginAccessDeniedError(serverId);
    }
    return api.json(res);
  }
};

/** У профиля нет доступа к плагину сервера (403 обмена или код закрытия 4403 сокета). */
export class PluginAccessDeniedError extends Error {
  constructor(serverId) {
    super(`No access to server ${serverId}`);
    this.serverId = serverId;
  }
}
