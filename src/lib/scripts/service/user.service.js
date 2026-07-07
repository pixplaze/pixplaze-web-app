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
    this.#store = createUserStore(token => this.#handleAuthorizedEvent(token));

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
    console.log('username retrieved')
    return this.#store.user?.name || 'Профиль';
  }

  async #handleAuthorizedEvent(token) {
    if (!token) return null;
    const user = buildUserFromToken(token);
    const res = await api.get('/profiles/' + user.id);
    if (!res.ok) return user;
    const info = await res.json();
    const {profile, ...extra} = info;
    // console.log('user enriched...');
    return {...user, ...profile, ...extra};
  }
}

export const userService = new UserService();
