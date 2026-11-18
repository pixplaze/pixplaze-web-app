import {browser} from "$app/env";

const SHOW_SUGGESTION_AGAIN_KEY = 'pwa.showInstallSuggestionAgain';
const SHOW_SUGGESTION_TIMEOUT = 5000;

class PWA {
  #showInstallSuggestionEvent = $state(null);
  #showInstallSuggestion = $state(false);
  #showInstallSuggestionAgain = $state(false);
  hideInstallSuggestionAgain = $derived(!this.#showInstallSuggestionAgain);

  constructor() {
    if (!browser) return;

    this.#showInstallSuggestionAgain = readShowInstallSuggestionAgain();

    window.addEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', this.handleAppInstalled);

    $effect.root(() => {
      return () => {
        if (window) {
          window.removeEventListener('beforeinstallprompt', this.handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', this.handleAppInstalled);
        }
      };
    });
  }

  get isInstalled() {
    return browser &&
        window.navigator.standalone === true ||
        window.matchMedia('(display-mode: standalone)').matches;
  }

  get showInstallSuggestion() {
    return !this.isInstalled && this.#showInstallSuggestionAgain && (true || this.#showInstallSuggestion);
  }

  handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    this.#showInstallSuggestionEvent = e;
    setTimeout(() => this.#showInstallSuggestion = true, SHOW_SUGGESTION_TIMEOUT);
  };

  handleAppInstalled = () => {
    // TODO: благодарить пользователя за установку, при положительном ответе
    //  и объяснить, почему нужно установить приложение, при отрицательном
    // Очищаем состояние, когда приложение успешно установлено
    this.#showInstallSuggestionEvent = null;
    this.#showInstallSuggestion = false;
  };

  install = async () => {
    if (!this.#showInstallSuggestionEvent) return;

    // Показываем системное окно установки поверх нашего приложения
    this.#showInstallSuggestionEvent.prompt();

    // Ждем ответа пользователя (установил или отклонил)
    const { outcome } = await this.#showInstallSuggestionEvent.userChoice;
    console.log(`PWA suggestion answer: ${outcome}`);

    // В любом случае очищаем prompt, так как его нельзя использовать повторно
    this.#showInstallSuggestionEvent = null;
    this.#showInstallSuggestion = false;
    this.#showInstallSuggestionAgain = !this.hideInstallSuggestionAgain;
  }

  deny = () => {
    this.#showInstallSuggestion = false;
    this.#showInstallSuggestionAgain = !this.hideInstallSuggestionAgain;
    localStorage.setItem(SHOW_SUGGESTION_AGAIN_KEY, JSON.stringify(this.#showInstallSuggestionAgain));
  }
}

function readShowInstallSuggestionAgain() {
  try {
    const showInstallSuggestionAgain = JSON.parse(localStorage.getItem(SHOW_SUGGESTION_AGAIN_KEY));
    return showInstallSuggestionAgain !== false;
  } catch (e) {
    return true;
  }
}

export const pwa = new PWA();