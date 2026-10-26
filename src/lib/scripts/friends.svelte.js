import {friendsApi} from '$lib/scripts/api/friends.api.js';

/**
 * Онлайн профиля и его взаимных друзей — один запрос `/friends/online` на всех: панель персонажей
 * и панель друзей стоят на одной странице и берут данные отсюда. Одновременные {@link load} ждут
 * один запрос. Загружается только в браузере (из `onMount`), поэтому на сервере SSR состояние пустое
 * и между пользователями не делится.
 */
class Presence {
  /** @type {import('$lib/scripts/api/friends.api.js').OnlineProfile | null} свой онлайн */
  self = $state(null);
  /** @type {import('$lib/scripts/api/friends.api.js').OnlineProfile[]} взаимные друзья, без себя */
  friends = $state([]);

  #profileId = null;
  #pending = null;

  /**
   * Загрузить онлайн профиля заново.
   * @throws {Error} при ошибке запроса — панель показывает её сама
   */
  load(profileId) {
    if (profileId !== this.#profileId) {
      // Другой профиль (вход другим аккаунтом) — чужой онлайн не показываем даже до ответа
      this.#profileId = profileId;
      this.self = null;
      this.friends = [];
      this.#pending = null;
    }
    this.#pending ??= this.#fetch(profileId).finally(() => this.#pending = null);
    return this.#pending;
  }

  /** Свой игрок в сети по uuid; undefined — не в сети. */
  playerOnline(uuid) {
    return this.self?.players.find(player => player.uuid === uuid);
  }

  async #fetch(profileId) {
    const online = await friendsApi.online();
    // Пока шёл запрос, сменился профиль — ответ устарел
    if (profileId !== this.#profileId) return;
    this.self = online.find(entry => entry.profileId === profileId) ?? null;
    this.friends = online.filter(entry => entry.profileId !== profileId);
  }
}

export const presence = new Presence();
