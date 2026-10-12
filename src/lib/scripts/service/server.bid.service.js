import {api} from '$lib/scripts/api/api.config.js';
import {mapServer} from '$lib/scripts/util/server.mapper.js';

/** Заявки на регистрацию серверов: свои — для пользователя, все — для админа. */
class ServerBidService {
  /**
   * Подать заявку на подключение сервера.
   * @returns {Promise<{inviteCode: string, preview: object}>} код заявки и превью карточки
   */
  async submit(request) {
    const bid = await api.json(await api.post('/servers/bids', {body: JSON.stringify(request)}));
    return {inviteCode: bid.inviteCode, preview: mapServer(bid.preview)};
  }

  /** Заявки текущего пользователя, новые первыми. */
  fetchMine() {
    return this.#get('/servers/bids');
  }

  /** Заявки для админа; без статуса — все. */
  fetchAll(status) {
    return this.#get(status ? `/admin/servers/bids?status=${status}` : '/admin/servers/bids');
  }

  /** Подтверждение заявки без плагина без проверки кода (админ). */
  approve(id) {
    return this.#post(`/admin/servers/bids/${id}/approve`);
  }

  /** Отклонение открытой заявки (админ). */
  reject(id) {
    return this.#post(`/admin/servers/bids/${id}/reject`);
  }

  async #get(endpoint) {
    return api.json(await api.get(endpoint));
  }

  async #post(endpoint) {
    await api.ensureOk(await api.post(endpoint));
  }
}

export const serverBidService = new ServerBidService();
