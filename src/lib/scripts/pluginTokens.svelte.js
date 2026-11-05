import {browser} from '$app/environment';
import {token} from '$api/token.svelte.js';
import {serversApi} from '$api/servers.api.js';
import {buildUserFromToken} from '$util/user.mapper.js';

/** Токен считается истёкшим заранее: успеть переподключиться или прислать новый AUTH. */
const EXPIRY_MARGIN_MS = 30_000;

/**
 * Токены доступа к плагину: самостоятельные токены фронта, по одному на сервер, только в памяти.
 * Получаются обменом токена профиля ({@link serversApi.exchangePluginToken}); токен профиля плагину
 * не передаётся никогда. После перезагрузки страницы токены получаются заново — обмен дешёвый.
 *
 * Сменился пользователь (вход, выход, вход другим аккаунтом в другой вкладке) — все токены сбрасываются.
 * Обычный refresh того же пользователя их не трогает.
 */
class PluginTokens {
  /** serverId → {accessToken, expiresAt} */
  #tokens = new Map();
  /** serverId → Promise обмена: одновременные запросы ждут один обмен */
  #pending = new Map();

  constructor() {
    if (!browser) {
      return;
    }
    let userId = buildUserFromToken(token.value)?.id ?? null;
    $effect.root(() => {
      $effect(() => {
        const next = buildUserFromToken(token.value)?.id ?? null;
        if (next !== userId) {
          userId = next;
          this.clear();
        }
      });
    });
  }

  /**
   * Действующий токен доступа к плагину сервера: из кеша или новым обменом.
   * @returns {Promise<{accessToken: string, expiresAt: number}>} `expiresAt` — мс epoch
   * @throws {PluginAccessDeniedError} у профиля нет доступа к серверу
   */
  get(serverId) {
    const cachedTokens = this.#tokens.get(serverId);
    if (cachedTokens && cachedTokens.expiresAt - Date.now() > EXPIRY_MARGIN_MS) {
      return Promise.resolve(cachedTokens);
    }
    if (!this.#pending.has(serverId)) {
      const pendingTokens = this.#exchange(serverId)
          .finally(() => this.#pending.delete(serverId));
      this.#pending.set(serverId, pendingTokens);
    }
    return this.#pending.get(serverId);
  }

  /** Плагин отверг токен (401, код 4401) — следующий {@link get} получит новый. */
  invalidate(serverId) {
    this.#tokens.delete(serverId);
  }

  clear() {
    this.#tokens.clear();
    this.#pending.clear();
  }

  /** Сколько мс до момента, когда токен пора менять (за {@link EXPIRY_MARGIN_MS} до истечения). */
  renewIn(entry) {
    return Math.max(entry.expiresAt - Date.now() - EXPIRY_MARGIN_MS, 0);
  }

  async #exchange(serverId) {
    const {accessToken, expiresIn} = await serversApi.exchangePluginToken(serverId);
    const entry = {accessToken, expiresAt: Date.now() + expiresIn * 1000};
    this.#tokens.set(serverId, entry);
    return entry;
  }
}

export const pluginTokens = new PluginTokens();
