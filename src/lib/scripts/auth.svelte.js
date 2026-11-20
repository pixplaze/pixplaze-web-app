import {api} from '#api/client.js';
import {authApi} from '#api/auth.api.js';
import {token} from '#api/token.svelte.js';
import {permissions} from '#scripts/permissions.svelte.js';

/** Имя Web Lock: refresh выполняется одной вкладкой за раз. */
const REFRESH_LOCK = 'pixplaze-auth-refresh';

/**
 * Авторизация: вход, регистрация, выход и обновление access-токена на ответ 401.
 * Очередь refresh: при истечении токена обновление одно на все ожидающие запросы — и одно на все вкладки.
 * Refresh-токен одноразовый, и web-api считает его повторное предъявление кражей и отзывает все сессии
 * профиля. Две вкладки, одновременно получившие 401, отправили бы одну и ту же куку — поэтому refresh
 * идёт под Web Lock, а вкладка, дождавшаяся замка, сначала смотрит, не обновила ли токен другая.
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
    const rejected = token.value;
    this.#refreshing ??= this.#refreshExclusively(rejected).finally(() => this.#refreshing = null);
    return this.#refreshing;
  }

  /** Refresh под замком на все вкладки; без Web Locks (старый браузер) — как раньше, в пределах вкладки. */
  #refreshExclusively(rejected) {
    if (typeof navigator === 'undefined' || !navigator.locks) {
      return this.#refresh();
    }
    return navigator.locks.request(REFRESH_LOCK, () => {
      // Пока ждали замок, другая вкладка обновила токен: кука уже новая, свой refresh не нужен
      const stored = token.stored;
      if (stored && stored !== rejected) {
        token.set(stored);
        return stored;
      }
      return this.#refresh();
    });
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
