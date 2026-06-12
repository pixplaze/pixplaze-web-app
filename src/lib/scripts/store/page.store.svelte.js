import {browser} from '$app/environment';

export const THEME_STORAGE_KEY = 'currentTheme';
export const IS_ASIDE_EXPANDED_STORAGE_KEY = 'isAsideExpanded';

/**
 * Глобальное реактивное состояние страницы: тема, развёрнутость боковой панели и
 * списка избранных серверов, флаг загрузки. Чистое состояние без бизнес-логики
 * (ею занимается page.service). Singleton — один источник истины на всё приложение.
 */
class PageStore {
  currentTheme = $state(browser ? localStorage.getItem(THEME_STORAGE_KEY) || 'light' : 'light');
  isAsideExpanded = $state(browser ? JSON.parse(localStorage.getItem(IS_ASIDE_EXPANDED_STORAGE_KEY)) || false : false);
  isFavoriteServersExpanded = $state(false);
  isLoading = $state(false);
}

export const pageStore = new PageStore();
