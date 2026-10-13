import {browser} from '$app/environment';

const THEME_STORAGE_KEY = 'currentTheme';
const IS_ASIDE_EXPANDED_STORAGE_KEY = 'isAsideExpanded';
const THEMES = ['light', 'dark'];

/** Состояние интерфейса: тема, боковая панель, список избранных серверов. */
class Ui {
  #theme = $state(browser ? localStorage.getItem(THEME_STORAGE_KEY) || 'light' : 'light');
  #asideExpanded = $state(browser ? JSON.parse(localStorage.getItem(IS_ASIDE_EXPANDED_STORAGE_KEY)) || false : false);
  #favoritesExpanded = $state(false);

  get theme() {
    return this.#theme;
  }

  get asideExpanded() {
    return this.#asideExpanded;
  }

  get favoritesExpanded() {
    return this.#favoritesExpanded;
  }

  isMobileLayout() {
    return window.innerWidth <= 440;
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

  /** На мобильном панель перекрывает экран: после выбора пункта меню её закрываем. */
  closeAsideOnMobile() {
    if (this.isMobileLayout() && this.#asideExpanded) {
      this.toggleAside();
    }
  }

  toggleFavorites() {
    this.#favoritesExpanded = !this.#favoritesExpanded;
  }
}

export const ui = new Ui();
