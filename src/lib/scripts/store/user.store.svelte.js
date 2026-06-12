import {authStore} from "$lib/scripts/store/auth.store.svelte.js";

/**
 * Generic-реактивная обвязка без бизнес-логики: знает только, что пользователь
 * выводится из access-токена через переданную функцию-маппер. Что именно считать
 * (парсинг JWT, форма user) — забота сервиса, который впрыскивает mapTokenToUser.
 *
 * @param {(token: string) => *} mapTokenToUser
 */
export function createUserStore(mapTokenToUser) {
  const user = $derived.by(() => mapTokenToUser(authStore.accessToken));
  return {
    get user() { return user; }
  };
}
