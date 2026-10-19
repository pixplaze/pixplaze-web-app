import {api} from '$lib/scripts/api/client.js';
import {authApi} from '$lib/scripts/api/auth.api.js';
import {token} from '$lib/scripts/api/token.svelte.js';
import {permissions} from '$lib/scripts/permissions.svelte.js';

/**
 * Авторизация: вход, регистрация, выход и обновление access-токена на ответ 401.
 * Очередь refresh: при истечении токена обновление одно на все ожидающие запросы.
 */
class Auth {
  #refreshing = null;

  constructor() {
    // Обработка 401 в низкоуровневом клиенте
    api.setUnauthorizedHandler(() => this.#handleUnauthorized());

    // Сессия есть, а подсказки с правами нет (вход до её появления) — получаем её refresh-ом
    if (token.value && !permissions.hasHint) {
      this.refresh();
    }
  }

  /** Авторизован ли пользователь (реактивно). */
  get isAuthenticated() {
    return !!token.value;
  }

  /** @returns {Promise<string|null>} access-токен или null, если сервер отказал */
  async signIn(signInData) {
    return this.#accept(await authApi.signIn(signInData));
  }

  /** @returns {Promise<string|null>} access-токен или null, если сервер отказал */
  async signUp(signUpData) {
    return this.#accept(await authApi.signUp(signUpData));
  }

  async signOut() {
    try {
      await authApi.signOut();
    } catch {
      // Сервер недоступен — локально выходим всё равно
    } finally {
      token.clear();
    }
  }

  /**
   * Обновить access-токен вне ответа 401 — например, после изменения профиля, чтобы токен
   * принёс новые имя и email. Идёт через ту же очередь, что и обновление по 401.
   * @returns {Promise<string|null>} access-токен или null
   */
  refresh() {
    return this.#handleUnauthorized();
  }

  /** Сессия из ответа: токен и подсказка с правами. Возвращает токен или null. */
  #accept(session) {
    if (session) {
      permissions.set(session.permissions);
      token.set(session.accessToken);
    }
    return session?.accessToken ?? null;
  }

  /**
   * Вызывается клиентом при ответе 401. Возвращает новый access-токен, по которому
   * исходный запрос будет повторён, или null — тогда клиент отдаёт исходный ответ 401.
   * Отказ сервера в refresh (сессия истекла/отозвана) — выход; сетевая ошибка — токен
   * не трогаем, следующий запрос попробует обновить его снова.
   */
  #handleUnauthorized() {
    // Если обновление уже идёт — ждём его результата
    this.#refreshing ??= this.#refresh().finally(() => this.#refreshing = null);
    return this.#refreshing;
  }

  async #refresh() {
    let session;
    try {
      session = await authApi.refresh();
    } catch {
      return null; // Сеть недоступна: сессию не завершаем
    }

    if (!session) {
      await this.signOut();
    }
    return this.#accept(session);
  }
}

export const auth = new Auth();
