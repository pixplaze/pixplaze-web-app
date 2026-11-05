/**
 * Короткая подсказка у курсора («IP скопирован»). Один экземпляр на приложение — {@link PointerHint}
 * в раскладке: так её не ломает transform у карточек (fixed внутри transform считается от предка).
 */
class PointerHintStore {
  text = $state('');
  x = $state(0);
  y = $state(0);
  /** Растёт с каждым показом: повторный клик перезапускает анимацию, а не продлевает старую. */
  key = $state(0);

  #timer;

  /**
   * @param {string} text
   * @param {MouseEvent|KeyboardEvent} event клик по кнопке; с клавиатуры (detail === 0) — у самой кнопки
   * @param {number} [duration] сколько показывать, мс
   */
  show(text, event, duration = 1200) {
    const fromKeyboard = !event || event.detail === 0 || (event.clientX === 0 && event.clientY === 0);
    if (fromKeyboard && event?.currentTarget instanceof Element) {
      const rect = event.currentTarget.getBoundingClientRect();
      this.x = rect.left + rect.width / 2;
      this.y = rect.top;
    } else {
      this.x = event?.clientX ?? 0;
      this.y = event?.clientY ?? 0;
    }
    this.text = text;
    this.key++;

    clearTimeout(this.#timer);
    this.#timer = setTimeout(() => this.text = '', duration);
  }
}

export const pointerHint = new PointerHintStore();
