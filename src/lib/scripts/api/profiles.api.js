import {api} from '$lib/scripts/api/client.js';

/** Профили пользователей. */
export const profilesApi = {
  /** Профиль с дополнительными сведениями: {profile, ...extra}. */
  async fetchById(id) {
    return api.json(await api.get(`/profiles/${id}`));
  }
};
