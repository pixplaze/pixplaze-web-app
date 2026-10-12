import {api} from '$lib/scripts/api/api.config.js';
import {mapServer} from '$lib/scripts/util/server.mapper.js';

/** Избранные серверы текущего пользователя. */
class ServerFavoriteService {
  /** Избранные серверы как модели карточки ({@link mapServer}). */
  async fetchMine() {
    return (await api.json(await api.get('/servers/favorite'))).map(mapServer);
  }
}

export const serverFavoriteService = new ServerFavoriteService();
