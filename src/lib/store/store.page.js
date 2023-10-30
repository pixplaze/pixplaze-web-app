import {writable, get} from "svelte/store";

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
  const themeStore = createThemeStore(['light', 'dark'], 'light')
  const isLoading = writable(false);
  const isAsideExpanded = writable(true);
  const currentTheme = writable(themeStore.current());

  function toggleAside() {
    if (get(isAsideExpanded)) {
      isAsideExpanded.set(false);
    } else {
      isAsideExpanded.set(true);
    }
  }

  function toggleTheme() {
    currentTheme.set(themeStore.toggle());
    // console.log(themeStore.current());
  }

  return {
    isLoading: {...isLoading},
    isAsideExpanded: {...isAsideExpanded},
    currentTheme: {...currentTheme},
    toggleAside,
    toggleTheme,
  }
}