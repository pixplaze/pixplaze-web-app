import {friendsApi} from '$lib/scripts/api/friends.api.js';
import {notifications} from '$lib/scripts/notifications.svelte.js';
import {presence} from '$lib/scripts/presence.svelte.js';

/**
 * Друзья: добавить по имени, ответить на заявку, убрать; кто из взаимных друзей в сети и где.
 * Онлайн видят только взаимные друзья.
 */
export class FriendsPanel {
  friends = $state([]);
  failed = $state(false);

  #profileId;

  constructor(profileId) {
    this.#profileId = profileId;
  }

  /** Взаимные друзья с игроками в сети и временем выхода (без самого профиля). */
  get online() {
    return presence.friends;
  }

  get incoming() {
    return this.friends.filter(friend => friend.status === 'INCOMING');
  }

  get outgoing() {
    return this.friends.filter(friend => friend.status === 'OUTGOING');
  }

  async load() {
    this.failed = false;
    try {
      const [friends] = await Promise.all([friendsApi.list(), presence.load(this.#profileId)]);
      this.friends = friends;
    } catch {
      this.failed = true;
    }
  }

  /** @returns {Promise<boolean>} добавлен ли */
  async add(name) {
    try {
      await friendsApi.add(name.trim());
      await this.load();
      return true;
    } catch (error) {
      notifications.error(`Не удалось добавить в друзья: ${error.message}`);
      return false;
    }
  }

  async remove(friend) {
    try {
      await friendsApi.remove(friend.profileId);
      await this.load();
    } catch (error) {
      notifications.error(`Не удалось убрать из друзей: ${error.message}`);
    }
  }
}
