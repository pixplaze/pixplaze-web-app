import {api} from '$lib/scripts/api/api.config.js';
import {authStore} from "$lib/scripts/store/auth.store.svelte.js";

class AuthService {
  async signUp(data) {
    const response = await api.signUp(data);
    console.log(response);
    authStore.setAccessToken(response.accessToken);
  }

  async signIn(data) {
    const response = await api.signIn()
    authStore.setAccessToken(response.accessToken);
  }
}

export function parseJwt(token) {
  const base64 = token.split('.')[1].replace(/-/g, '+')
      .replace(/_/g, '/');
  const jsonPayload = decodeURIComponent(
      window.atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
  );

  return JSON.parse(jsonPayload);
}


export const authService = new AuthService();