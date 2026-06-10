import {authService} from "$lib/scripts/service/auth.service.js";
import {userStore} from "$lib/scripts/store/user.store.svelte.js";
import {parseJwt} from "$lib/scripts/util/jwt.util.js";

class UserService {
  getCurrentUser() {

  }

  async signUp(data){
    const token = await authService.signUp(data);
    console.log(parseJwt(token));
  }

  async signIn(data){
    const token = await authService.signIn(data);
    console.log(parseJwt(token));
  }

  async signOut() {
    await authService.signOut();
    userStore.user = null;
  }
}

export const userService = new UserService();