import {writable, get} from 'svelte/store';
import {browser} from '$app/environment'

const createThemeStore = (themes, currentTheme) => {
  let index = themes.indexOf(currentTheme);

  function forward() {
    index = index < themes.length ? ++index : index;
  }

  function backward() {
    index = index > 0 ? --index : index;
  }

  function toggle() {
    if (index === themes.length - 1) {
      index = 0;
    } else {
      forward();
    }
    return current();
  }

  function current() {
    return themes[index];
  }

  return {
    forward,
    backward,
    toggle,
    current
  }
}

export const createPageStore = () => {
  const currentTheme = writable(browser ? localStorage.getItem('currentTheme') || 'light' : 'light');
  const themeStore = createThemeStore(['light', 'dark'], get(currentTheme));
  const isLoading = writable(false);
  const isAsideExpanded = writable(false);

  function toggleAside() {
    if (get(isAsideExpanded)) {
      isAsideExpanded.set(false);
    } else {
      isAsideExpanded.set(true);
    }
  }

  function toggleTheme() {
    const theme = themeStore.toggle();
    currentTheme.set(theme);
    localStorage.setItem('currentTheme', theme);

  }

  return {
    isLoading: {...isLoading},
    isAsideExpanded: {...isAsideExpanded},
    currentTheme: {...currentTheme},
    toggleAside,
    toggleTheme,
  }
}