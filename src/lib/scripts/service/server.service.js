import {api} from '$lib/scripts/api/api.config.js';
import {mapServer} from '$lib/scripts/util/server.mapper.js';

/** Листинг Minecraft-серверов: модели карточек ({@link mapServer}). */
class ServerService {
  /**
   * Все серверы листинга.
   * @param {typeof fetch} [fetch] `fetch` из `load` SvelteKit при SSR
   */
  async fetchAll(fetch) {
    return (await api.json(await api.get('/servers', {fetch}))).map(mapServer);
  }

  /**
   * Поиск по листингу.
   * @param {AbortSignal} [signal] отмена устаревшего запроса при продолжении ввода
   */
  async search(query, signal) {
    const res = await api.get(`/servers?search=${encodeURIComponent(query.trim())}`, {signal});
    return (await api.json(res)).map(mapServer);
  }

  async rate(serverId, rating) {
    await api.ensureOk(await api.post(`/servers/rate/${serverId}?rating=${rating}`));
  }
}

export const serverService = new ServerService();
