import {friendsApi} from '$api/friends.api.js';
import {notifications} from '$scripts/notifications.svelte.js';

/**
 * Друзья профиля и онлайн: свой и взаимных друзей. Онлайн — один запрос `/friends/online` на всех:
 * панель персонажей и панель друзей стоят на одной странице и берут данные отсюда. Одновременные
 * {@link loadOnline} ждут один запрос. Загружается только в браузере (из `onMount`), поэтому на
 * сервере SSR состояние пустое и между пользователями не делится.
 */
class Friends {
  /** @type {{profileId: number, name: string, status: 'MUTUAL'|'OUTGOING'|'INCOMING'}[]} все друзья и заявки */
  list = $state([]);
  /** @type {import('$api/friends.api.js').OnlineProfile | null} свой онлайн */
  self = $state(null);
  /** @type {import('$api/friends.api.js').OnlineProfile[]} взаимные друзья в сети, без себя */
  online = $state([]);

  #profileId = null;
  #pending = null;

  get incoming() {
    return this.list.filter(friend => friend.status === 'INCOMING');
  }

  get outgoing() {
    return this.list.filter(friend => friend.status === 'OUTGOING');
  }

  /**
   * Загрузить друзей и онлайн профиля заново.
   * @throws {Error} при ошибке запроса — панель показывает её сама
   */
  async load(profileId) {
    // Другой профиль (вход другим аккаунтом) — чужих друзей не показываем даже до ответа
    if (profileId !== this.#profileId) this.list = [];
    const [list] = await Promise.all([friendsApi.list(), this.loadOnline(profileId)]);
    // Пока шёл запрос, сменился профиль — ответ устарел
    if (profileId !== this.#profileId) return;
    this.list = list;
  }

  /**
   * Загрузить онлайн профиля заново.
   * @throws {Error} при ошибке запроса — панель показывает её сама
   */
  loadOnline(profileId) {
    if (profileId !== this.#profileId) {
      // Другой профиль (вход другим аккаунтом) — чужой онлайн не показываем даже до ответа
      this.#profileId = profileId;
      this.self = null;
      this.online = [];
      this.#pending = null;
    }
    this.#pending ??= this.#fetchOnline(profileId).finally(() => this.#pending = null);
    return this.#pending;
  }

  /** Свой игрок в сети по uuid; undefined — не в сети. */
  playerOnline(uuid) {
    return this.self?.players.find(player => player.uuid === uuid);
  }

  /** @returns {Promise<boolean>} добавлен ли */
  async add(name) {
    try {
      await friendsApi.add(name.trim());
    } catch (error) {
      notifications.error(`Не удалось добавить в друзья: ${error.message}`);
      return false;
    }
    await this.#reload();
    return true;
  }

  async remove(friend) {
    try {
      await friendsApi.remove(friend.profileId);
    } catch (error) {
      notifications.error(`Не удалось убрать из друзей: ${error.message}`);
      return;
    }
    await this.#reload();
  }

  async #reload() {
    try {
      await this.load(this.#profileId);
    } catch (error) {
      notifications.error(`Не удалось загрузить друзей: ${error.message}`);
    }
  }

  async #fetchOnline(profileId) {
    const online = await friendsApi.online();
    // Пока шёл запрос, сменился профиль — ответ устарел
    if (profileId !== this.#profileId) return;
    this.self = online.find(entry => entry.profileId === profileId) ?? null;
    this.online = online.filter(entry => entry.profileId !== profileId);
  }
}

export const friends = new Friends();
