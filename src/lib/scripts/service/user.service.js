import {authService} from "$lib/scripts/service/auth.service.js";
import {authStore} from "$lib/scripts/store/auth.store.svelte.js";
import {createUserStore} from "$lib/scripts/store/user.store.svelte.js";
import {buildUserFromToken} from "$lib/scripts/util/user.mapper.js";
import {api} from "$lib/scripts/api/api.config.js";

class UserService {
  #store;
  constructor() {
    // authService.addAuthorizedEventHandler((token) => this.#handleAuthorizedEvent(token));
    // authService.addUnauthorizedEventHandler(() => this.#handleUnauthorizedEvent());
    this.#store = createUserStore(buildUserFromToken, user => this.#withProfile(user));

    const existingToken = authStore.getAccessToken();
    // this.#handleAuthorizedEvent(existingToken).then();
  }

  async signUp(data){
    // Токен кладётся в authStore внутри authService — user выведется сам.
    await authService.signUp(data);
  }

  async signIn(data){
    await authService.signIn(data);
  }

  async signOut() {
    // authService.signOut() чистит токен — user станет null автоматически.
    await authService.signOut();
  }

  get user() {
    return this.#store.user;
  }

  get username() {
    return this.#store.user?.name || 'Профиль';
  }

  /** Пользователь из токена, дополненный профилем; при ошибке — как был. */
  async #withProfile(user) {
    try {
      const res = await api.get('/profiles/' + user.id);
      if (!res.ok) return user;
      const {profile, ...extra} = await res.json();
      return {...user, ...profile, ...extra};
    } catch {
      return user;
    }
  }
}

export const userService = new UserService();
