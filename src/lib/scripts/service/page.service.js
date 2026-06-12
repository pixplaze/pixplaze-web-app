import {browser} from '$app/environment';
import {IS_ASIDE_EXPANDED_STORAGE_KEY, THEME_STORAGE_KEY, pageStore} from '$lib/scripts/store/page.store.svelte.js';
import {authService} from '$lib/scripts/service/auth.service.js';
import {ROUTES} from '$lib/scripts/routes.js';

const THEMES = ['light', 'dark'];

/**
 * Бизнес-логика страницы: тема, боковая панель, список избранных, флаг загрузки,
 * навигация и auth-guard. Реактивное состояние держит page.store. Навигатор
 * (goto/replaceState) впрыскивается из корневого +layout, чтобы сервис не зависел
 * от $app/navigation. Read-only геттеры дают компонентам доступ без знания о сторе.
 */
class PageService {
  // Заглушки до инициализации через setNavigator (точка композиции — корневой layout).
  #navigate = () => {};
  #replace = () => {};

  /** Впрыснуть SvelteKit-навигатор. @param {{goto: Function, replaceState: Function}} nav */
  setNavigator({goto, replaceState}) {
    this.#navigate = goto;
    this.#replace = replaceState;
  }

  /** Текущая тема (read-only, реактивно). */
  get currentTheme() {
    return pageStore.currentTheme;
  }

  /** Развёрнута ли боковая панель (read-only, реактивно). */
  get isAsideExpanded() {
    return pageStore.isAsideExpanded;
  }

  /** Развёрнут ли список избранных серверов (read-only, реактивно). */
  get isFavoriteServersExpanded() {
    return pageStore.isFavoriteServersExpanded;
  }

  /** Идёт ли загрузка (read-only, реактивно). */
  get isLoading() {
    return pageStore.isLoading;
  }

  /** Авторизован ли пользователь (read-only, реактивно). */
  get isAuthenticated() {
    return authService.isAuthenticated;
  }

  /**
   * Нужно ли увести неавторизованного пользователя на страницу входа.
   * Страницы /auth/* исключены, чтобы не зацикливать сам логин.
   * @param {string} pathname текущий путь
   */
  shouldRedirectToAuth(pathname) {
    return !this.isAuthenticated && !pathname.startsWith('/auth');
  }

  /** Применить guard: увести неавторизованного на вход. Зовётся из реактивного эффекта. */
  enforceAuth(pathname) {
    if (this.shouldRedirectToAuth(pathname)) {
      this.#navigate(ROUTES.signIn);
    }
  }

  toggleAside() {
    pageStore.isAsideExpanded = !pageStore.isAsideExpanded;
    if (browser) {
      localStorage.setItem(IS_ASIDE_EXPANDED_STORAGE_KEY, pageStore.isAsideExpanded);
    }
  }

  toggleFavoriteServers() {
    pageStore.isFavoriteServersExpanded = !pageStore.isFavoriteServersExpanded;
  }

  setLoading(value) {
    pageStore.isLoading = value;
  }

  /** Переключить тему на следующую по кругу и сохранить выбор. */
  toggleTheme() {
    const index = THEMES.indexOf(pageStore.currentTheme);
    const next = THEMES[(index + 1) % THEMES.length];

    pageStore.currentTheme = next;
    if (browser) {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    }
    return next;
  }

  // --- Навигация (через впрыснутый навигатор) ---

  goToServersConsole() { this.#navigate(ROUTES.serversConsole); }
  goToServersMap()     { this.#navigate(ROUTES.serversMap); }
  goToServersList()    { this.#navigate(ROUTES.serversList); }
  goToServersChat()    { this.#navigate(ROUTES.serversChat); }

  /** Отразить активную форму авторизации в URL без добавления записи в историю. */
  setAuthMode(mode, search = '') {
    // Второй аргумент — обязательный объект page-state для shallow routing SvelteKit.
    this.#replace(`${ROUTES.auth(mode)}${search}`, {});
  }
}

export const pageService = new PageService();
