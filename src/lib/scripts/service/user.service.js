import {authService} from "$lib/scripts/service/auth.service.js";
import {createUserStore} from "$lib/scripts/store/user.store.svelte.js";
import {buildUserFromToken} from "$lib/scripts/util/user.mapper.js";

class UserService {
  // Сервис «создаёт» стор, впрыскивая в него доменную логику token → user.
  #store = createUserStore(buildUserFromToken);

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
}

export const userService = new UserService();
