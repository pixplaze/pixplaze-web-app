import {api} from '$lib/scripts/api/client.js';

/**
 * Онлайн профиля: игроки в сети и время выхода. У друга со «скрывать онлайн» — без игроков и времени.
 * @typedef {{profileId: number, name: string, players: OnlinePlayer[], lastSeenAt: string|null}} OnlineProfile
 */
/**
 * Игрок в сети и сервер, на котором он сейчас. Сервер — кратко (`MinecraftServerInfo.brief`): id, название
 * и адреса `hosts`, как в списке серверов; если web-api сервер ещё не знает — только id.
 * @typedef {{uuid: string, username: string,
 *   server: {id: number, name?: string, hosts?: {address: string, port: number, type: string}[]}}} OnlinePlayer
 */

/**
 * Профиль из поиска: голова скина одного из его игроков (Base64 PNG без `data:`, может не быть) и отношение
 * к искавшему.
 * @typedef {{profileId: number, name: string, skinHeadBase64: string|null,
 *   status: 'MUTUAL'|'OUTGOING'|'INCOMING'|'NONE'}} FoundProfile
 */

/** Друзья текущего профиля и их онлайн (GET/POST /friends, DELETE /friends/{id}, GET /friends/online). */
export const friendsApi = {
  /** Друзья: `{profileId, name, status}`, status — MUTUAL | OUTGOING | INCOMING. */
  async list() {
    return api.json(await api.get('/friends'));
  },

  /** Добавить в друзья по имени профиля. */
  async add(name) {
    await api.ensureOk(await api.post('/friends', {body: JSON.stringify({name})}));
  },

  /** Убрать друга со своей стороны. */
  async remove(profileId) {
    await api.ensureOk(await api.delete(`/friends/${profileId}`));
  },

  /**
   * Поиск профилей по началу имени профиля или ника игрока (от 2 символов, до 20 результатов).
   * @param {AbortSignal} [signal] отмена устаревшего запроса при продолжении ввода
   * @returns {Promise<FoundProfile[]>}
   */
  async search(query, signal) {
    return api.json(await api.get(`/friends/search?q=${encodeURIComponent(query.trim())}`, {signal}));
  },

  /** Онлайн свой и взаимных друзей. @returns {Promise<OnlineProfile[]>} */
  async online() {
    return api.json(await api.get('/friends/online'));
  }
};
