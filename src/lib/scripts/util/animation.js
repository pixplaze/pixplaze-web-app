import {backOut} from "svelte/easing";

export function blockDrop(node, options = {}) {
  return {
    delay: options.delay || 0,
    duration: options.duration || 300,
    // Передаем функцию плавности прямо в настройки транзишена Svelte
    easing: backOut,
    css: (t) => {
      const scale = 1 + (t * 0.025);

      return `transform: scale(${scale}) translateY(${scale * -5}px);
                opacity: ${t};`;
    }
  };
}