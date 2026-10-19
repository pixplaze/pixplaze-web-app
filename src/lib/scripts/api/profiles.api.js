import {api} from '$lib/scripts/api/client.js';

/** Профили пользователей. */
export const profilesApi = {
  /** Профиль с дополнительными сведениями: {profile, ...extra}. */
  async fetchById(id) {
    return api.json(await api.get(`/profiles/${id}`));
  },

  /**
   * Изменить свой профиль: передаются только меняемые поля.
   * @param {{username?: string, email?: string, password?: string, currentPassword?: string, isOnlineHidden?: boolean}} request
   * @returns {Promise<object>} профиль с дополнительными сведениями: {profile, ...extra}
   */
  async update(id, request) {
    return api.json(await api.patch(`/profiles/${id}`, {body: JSON.stringify(request)}));
  },

  /**
   * Игроки профиля с серверами: `{uuid, username, skinHeadBase64, servers: [{minecraftServerId, name, isOperator, isPrimary}]}`.
   */
  async fetchPlayers(id) {
    return api.json(await api.get(`/profiles/${id}/players`));
  },

  /** Сделать игрока основным на сервере: от его имени профиль работает с консолью и чатом. */
  async setPrimaryPlayer(id, uuid, minecraftServerId) {
    await api.ensureOk(await api.put(`/profiles/${id}/players/${uuid}/primary`, {body: JSON.stringify({minecraftServerId})}));
  },

  /** Отвязать игрока от профиля. */
  async unlinkPlayer(id, uuid) {
    await api.ensureOk(await api.delete(`/profiles/${id}/players/${uuid}`));
  }
};
