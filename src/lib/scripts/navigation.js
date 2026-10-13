import {goto, replaceState} from '$app/navigation';
import {auth} from '$lib/scripts/auth.svelte.js';
import {ROUTES} from '$lib/scripts/routes.js';

/** Навигация по маршрутам приложения и auth-guard. */
export const navigation = {
  goTo(url) {
    return goto(url);
  },

  goToServersConsole() { return goto(ROUTES.serversConsole); },
  goToServersMap()     { return goto(ROUTES.serversMap); },
  goToServersList()    { return goto(ROUTES.serversList); },
  goToServersChat()    { return goto(ROUTES.serversChat); },
  goToServersBids()    { return goto(ROUTES.serversBids); },
  goToProfile()        { return goto(ROUTES.profile); },

  /** Отразить активную форму авторизации в URL без добавления записи в историю. */
  setAuthMode(mode, search = '') {
    // Второй аргумент — обязательный объект page-state для shallow routing SvelteKit.
    replaceState(`${ROUTES.auth(mode)}${search}`, {});
  },

  /**
   * Увести неавторизованного на вход, СОХРАНИВ исходный query (напр. `?userCode=...`),
   * чтобы после входа вернуться к подтверждению устройства. Страницы /auth/* исключены,
   * чтобы не зацикливать сам вход. Зовётся из реактивного эффекта корневого layout.
   */
  enforceAuth(pathname, search = '') {
    if (!auth.isAuthenticated && !pathname.startsWith('/auth')) {
      goto(`${ROUTES.signIn}${search}`);
    }
  }
};
