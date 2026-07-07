import {authStore} from "$lib/scripts/store/auth.store.svelte.js";

export function createUserStore(handler) {
  let user = $state(null);
  // const username = $derived(user?.name || 'Профиль');

  $effect.root(() => {
    $effect(async () => {
      user = await handler(authStore.accessToken);
      console.log(user);
    });
  });

  return {
    get user() { return user; },
    // get username() { return username; }
  };
}
