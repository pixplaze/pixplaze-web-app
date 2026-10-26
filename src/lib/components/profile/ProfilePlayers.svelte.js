import {profilesApi} from '$lib/scripts/api/profiles.api.js';
import {presence} from '$lib/scripts/presence.svelte.js';
import {auth} from '$lib/scripts/auth.svelte.js';
import {notifications} from '$lib/scripts/notifications.svelte.js';

/**
 * Персонажи профиля: серверы каждого с признаком основного, кто сейчас в сети и где.
 * Основной игрок — от его имени профиль работает с консолью и чатом сервера.
 */
export class ProfilePlayers {
  players = $state([]);
  loading = $state(false);
  failed = $state(false);

  #profileId;

  constructor(profileId) {
    this.#profileId = profileId;
  }

  /** Свой онлайн: игроки в сети и серверы, на которых они сейчас; null — ещё не загружен. */
  get online() {
    return presence.self;
  }

  /** Игрок профиля в сети по uuid; undefined — не в сети. */
  playerOnline(uuid) {
    return presence.playerOnline(uuid);
  }

  async load() {
    this.loading = true;
    this.failed = false;
    try {
      const [players] = await Promise.all([
        profilesApi.fetchPlayers(this.#profileId),
        presence.load(this.#profileId)
      ]);
      this.players = players;
    } catch {
      this.failed = true;
    } finally {
      this.loading = false;
    }
  }

  async setPrimary(uuid, serverId) {
    try {
      await profilesApi.setPrimaryPlayer(this.#profileId, uuid, serverId);
      await this.load();
    } catch (error) {
      notifications.error(`Не удалось сменить основного игрока: ${error.message}`);
    }
  }

  async unlink(player) {
    try {
      await profilesApi.unlinkPlayer(this.#profileId, player.uuid);
      notifications.info(`Игрок ${player.username} отвязан`);
      await this.load();
      // Права на серверах игрока изменились — подсказка с правами придёт с новым токеном
      await auth.refresh();
    } catch (error) {
      notifications.error(`Не удалось отвязать игрока: ${error.message}`);
    }
  }
}
