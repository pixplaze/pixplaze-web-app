import {api} from '$lib/scripts/api/client.js';
import {authApi} from '$lib/scripts/api/auth.api.js';
import {token} from '$lib/scripts/api/token.svelte.js';

/**
 * Авторизация: вход, регистрация, выход и обновление access-токена на ответ 401.
 * Очередь refresh: при истечении токена обновление одно на все ожидающие запросы.
 */
class Auth {
  #refreshing = null;

  constructor() {
    // Обработка 401 в низкоуровневом клиенте
    api.setUnauthorizedHandler(() => this.#handleUnauthorized());
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

  #accept(accessToken) {
    if (accessToken) {
      token.set(accessToken);
    }
    return accessToken;
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
    let accessToken;
    try {
      accessToken = await authApi.refresh();
    } catch {
      return null; // Сеть недоступна: сессию не завершаем
    }

    if (accessToken) {
      token.set(accessToken);
    } else {
      await this.signOut();
    }
    return accessToken;
  }
}

export const auth = new Auth();
