import {api} from '$lib/scripts/api/client.js';

/** Профили пользователей. */
export const profilesApi = {
  /** Профиль с дополнительными сведениями: {profile, ...extra}. */
  async fetchById(id) {
    return api.json(await api.get(`/profiles/${id}`));
  },

  /**
   * Изменить свой профиль: передаются только меняемые поля.
   * @param {{username?: string, email?: string, password?: string, currentPassword?: string}} request
   * @returns {Promise<object>} профиль с дополнительными сведениями: {profile, ...extra}
   */
  async update(id, request) {
    return api.json(await api.patch(`/profiles/${id}`, {body: JSON.stringify(request)}));
  }
};
