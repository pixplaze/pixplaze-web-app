import {api} from '$lib/scripts/api/api.config.js';

/** Сообщение из ErrorResponse API; если тело не JSON — сам текст. */
export async function errorMessage(res) {
  const text = await res.text();
  try {
    return JSON.parse(text).message ?? text;
  } catch {
    return text;
  }
}

/** Заявки на регистрацию серверов: свои — для пользователя, все — для админа. */
class ServerBidService {
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
    const res = await api.get(endpoint);
    if (!res.ok) throw new Error(await errorMessage(res));
    return res.json();
  }

  async #post(endpoint) {
    const res = await api.post(endpoint);
    if (!res.ok) throw new Error(await errorMessage(res));
  }
}

export const serverBidService = new ServerBidService();
