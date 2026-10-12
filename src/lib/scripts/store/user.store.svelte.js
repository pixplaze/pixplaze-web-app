import {untrack} from "svelte";
import {authStore} from "$lib/scripts/store/auth.store.svelte.js";

/**
 * Пользователь, выведенный из access-токена. Сразу после смены токена — базовый
 * пользователь из токена ({@link fromToken}), затем — дополненный профилем ({@link enrich}).
 * Ответ профиля, пришедший после смены токена (выход, вход другим аккаунтом), отбрасывается.
 *
 * @param {(token: string) => object|null} fromToken пользователь из токена, синхронно
 * @param {(user: object) => Promise<object>} enrich пользователь, дополненный профилем
 */
export function createUserStore(fromToken, enrich) {
  let user = $state(null);

  $effect.root(() => {
    $effect(() => {
      const token = authStore.accessToken;
      const base = fromToken(token);
      // Обновление токена того же пользователя — поля профиля оставляем до нового ответа
      const previous = untrack(() => user);
      user = base && previous?.id === base.id ? {...previous, ...base} : base;
      if (!base) return;

      enrich(base).then((enriched) => {
        if (authStore.accessToken === token) {
          user = enriched;
        }
      });
    });
  });

  return {
    get user() { return user; },
  };
}
