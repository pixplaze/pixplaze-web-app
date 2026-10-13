import {untrack} from 'svelte';
import {token} from '$lib/scripts/api/token.svelte.js';
import {buildUserFromToken} from '$lib/scripts/util/user.mapper.js';
import {profilesApi} from '$lib/scripts/api/profiles.api.js';

/**
 * Текущий пользователь, выведенный из access-токена: сразу после смены токена —
 * пользователь из токена, затем — дополненный профилем. Токен меняется из многих мест
 * (вход, refresh, device-flow, другая вкладка), поэтому модуль сам следит за ним эффектом.
 */
class CurrentUser {
  #value = $state(null);

  constructor() {
    $effect.root(() => {
      $effect(() => this.#onToken(token.value));
    });
  }

  /** Пользователь или null, если не авторизован. */
  get value() {
    return this.#value;
  }

  get name() {
    return this.#value?.name || 'Профиль';
  }

  #onToken(accessToken) {
    const base = buildUserFromToken(accessToken);
    // Обновление токена того же пользователя — поля профиля оставляем до нового ответа
    const previous = untrack(() => this.#value);
    this.#value = base && previous?.id === base.id ? {...previous, ...base} : base;
    if (!base) return;

    this.#withProfile(base).then((user) => {
      // Ответ по устаревшему токену (выход, вход другим аккаунтом) отбрасываем
      if (token.value === accessToken) {
        this.#value = user;
      }
    });
  }

  /** Пользователь из токена, дополненный профилем; при ошибке — как был. */
  async #withProfile(user) {
    try {
      const {profile, ...extra} = await profilesApi.fetchById(user.id);
      return {...user, ...profile, ...extra};
    } catch {
      return user;
    }
  }
}

export const currentUser = new CurrentUser();
