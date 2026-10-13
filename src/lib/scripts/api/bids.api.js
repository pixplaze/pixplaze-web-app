import {api} from '$lib/scripts/api/client.js';
import {mapServer} from '$lib/scripts/util/server.mapper.js';

/** Заявки на регистрацию серверов: свои — для пользователя, все — для админа. */
export const bidsApi = {
  /**
   * Подать заявку на подключение сервера.
   * @returns {Promise<{inviteCode: string, preview: object}>} код заявки и превью карточки
   */
  async submit(request) {
    const bid = await api.json(await api.post('/servers/bids', {body: JSON.stringify(request)}));
    return {inviteCode: bid.inviteCode, preview: mapServer(bid.preview)};
  },

  /** Заявки текущего пользователя, новые первыми. */
  async fetchMine() {
    return api.json(await api.get('/servers/bids'));
  },

  /** Заявки для админа; без статуса — все. */
  async fetchAll(status) {
    return api.json(await api.get(status ? `/admin/servers/bids?status=${status}` : '/admin/servers/bids'));
  },

  /** Подтверждение заявки без плагина без проверки кода (админ). */
  async approve(id) {
    await api.ensureOk(await api.post(`/admin/servers/bids/${id}/approve`));
  },

  /** Отклонение открытой заявки (админ). */
  async reject(id) {
    await api.ensureOk(await api.post(`/admin/servers/bids/${id}/reject`));
  }
};
