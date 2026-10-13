import {api} from '$lib/scripts/api/client.js';
import {mapServer} from '$lib/scripts/util/server.mapper.js';

const mockFavoriteServers = (count) => {
  let servers = [];
  for (let i = 1; i <= count; i++) {
    servers.push({
      id: i,
      name: "Minecraft Server " + (i),
      hosts: [
        {type: "HOST", address: `mc.server${i}.net`, port: 22800+i},
        {type: "API", address: `mc.server${i}.net`, port: 22800+i+count},
        {type: "MAP", address: `mc.server${i}.net`, port: 22800+i+2*count}
      ]
    });
  }
  return servers;
}

/** Избранные серверы текущего пользователя. */
export const favoritesApi = {
  /** Избранные серверы как модели карточки ({@link mapServer}). */
  async fetchMine() {
    // return (await api.json(await api.get('/servers/favorite'))).map(mapServer);
    return mockFavoriteServers(20);
  },

  async add(serverId) {
    await api.ensureOk(await api.post(`/servers/favorite?serverIds=${serverId}`));
  },

  async remove(serverId) {
    await api.ensureOk(await api.delete(`/servers/favorite?serverIds=${serverId}`));
  }
};
