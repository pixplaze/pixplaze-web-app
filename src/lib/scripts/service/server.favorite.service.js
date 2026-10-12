import {api} from '$lib/scripts/api/api.config.js';
import {errorMessage} from '$lib/scripts/service/server.bid.service.js';
import {mapServer} from '$lib/scripts/util/server.mapper.js';

/** Избранные серверы текущего пользователя. */
class ServerFavoriteService {
  /** Избранные серверы как модели карточки ({@link mapServer}). */
  async fetchMine() {
    const res = await api.get('/servers/favorite');
    if (!res.ok) throw new Error(await errorMessage(res));
    return (await res.json()).map(mapServer);
  }
}

export const serverFavoriteService = new ServerFavoriteService();
