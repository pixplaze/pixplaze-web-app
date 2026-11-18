import {browser} from '$app/env';
import {auth} from "#scripts/auth.svelte.js";
import {navigation} from "#scripts/navigation.js";
import {pwa} from "#scripts/pwa.svelte.js";

const THEME_STORAGE_KEY = 'currentTheme';
const IS_ASIDE_EXPANDED_STORAGE_KEY = 'isAsideExpanded';
const THEMES = ['light', 'dark'];

/** Состояние интерфейса: тема, боковая панель, список избранных серверов. */
class App {
  #theme = $state(browser ? localStorage.getItem(THEME_STORAGE_KEY) || 'light' : 'light');
  #asideExpanded = $state(browser ? JSON.parse(localStorage.getItem(IS_ASIDE_EXPANDED_STORAGE_KEY)) || false : false);
  #favoritesExpanded = $state(false);

  get theme() {
    return this.#theme;
  }

  get isAsideExpanded() {
    return this.#asideExpanded;
  }

  get isFavoritesExpanded() {
    return this.#favoritesExpanded;
  }

  get isMobileLayout() {
    return window.innerWidth <= 440;
  }

  get isInstalled() {
    return pwa.isInstalled;
  }

  get isAppleMobile() {
    return window &&
        /iPad|iPhone|iPod/.test(navigator.userAgent) &&
        !window.MSStream ||
        navigator?.maxTouchPoints &&
        navigator?.maxTouchPoints > 1 &&
        /Macintosh/.test(userAgent);
  }

  /** Переключить тему на следующую по кругу и сохранить выбор. */
  toggleTheme() {
    this.#theme = THEMES[(THEMES.indexOf(this.#theme) + 1) % THEMES.length];
    localStorage.setItem(THEME_STORAGE_KEY, this.#theme);
  }

  toggleAside() {
    this.#asideExpanded = !this.#asideExpanded;
    localStorage.setItem(IS_ASIDE_EXPANDED_STORAGE_KEY, this.#asideExpanded);
  }

  toggleFavorites() {
    this.#favoritesExpanded = !this.#favoritesExpanded;
  }

  scrollTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  minimize() {
    if (this.isMobileLayout && this.#asideExpanded) {
      this.toggleAside();
    }

    if (this.#favoritesExpanded) {
      this.toggleFavorites();
    }
  }

  async singOut() {
    auth.signOut().then(async r => await navigation.goToAuth('sign-in'));
  }
}

export const app = new App();
