import {safeParse, safeParseAsync} from "valibot";
import {createNotice, LEVEL} from "$lib/scripts/util/notice.util.js";
import {createLatest} from "$lib/scripts/util/latest.util.js";

/** Пауза ввода, после которой показываются новые ошибки и вызывается onSuccess. */
const SHOW_DELAY = 500;

const isEmpty = (v) => v === '' || v === null || v === undefined;

/**
 * Поле формы с валидацией по схеме valibot. Значение проверяется сразу в сеттере
 * {@link value} — {@link isValid} всегда описывает текущее значение. Показ результата
 * отложен: ошибки исчезают сразу, как только значение стало валидным, а новые появляются
 * после паузы ввода ({@link SHOW_DELAY}); тогда же вызывается onSuccess. Пока идёт
 * асинхронная проверка, поле невалидно; ответ по устаревшему значению отбрасывается.
 *
 * Зависимое поле (повтор пароля) создаётся с `dependsOn`: смена значения того поля
 * перепроверяет зависимое.
 */
export class Field {
  isValid = $state(false);
  validationNotices = $state([]);
  validationClasses = $derived(computeClasses(this.validationNotices));

  #value = $state();
  #initial;
  #schema;
  #onSuccess;
  #dependents = [];
  #latest = createLatest();
  #showTimer = null;

  /**
   * @param {object} schema схема valibot
   * @param {{initial?: any, onSuccess?: (value) => any, dependsOn?: Field}} [options]
   */
  constructor(schema, {initial = '', onSuccess, dependsOn} = {}) {
    this.#schema = schema;
    this.#initial = initial;
    this.#onSuccess = onSuccess;
    this.#value = initial;
    dependsOn?.#dependents.push(this);
    this.#validate(initial);
  }

  get value() {
    return this.#value;
  }

  set value(value) {
    this.#value = value;
    this.#validate(value);
    this.#dependents.forEach(field => field.revalidate());
  }

  /** Перепроверить текущее значение (например, изменилось поле, от которого зависит это). */
  revalidate() {
    this.#validate(this.#value);
  }

  clear() {
    this.value = this.#initial;
  }

  async #validate(value) {
    const isLatest = this.#latest.next();
    clearTimeout(this.#showTimer);

    if (isEmpty(value)) {
      this.isValid = false;
      this.validationNotices = [];
      return;
    }

    let result;
    if (this.#schema.async) {
      this.isValid = false;
      result = await safeParseAsync(this.#schema, value);
      if (!isLatest()) return;
    } else {
      result = safeParse(this.#schema, value);
    }

    this.isValid = result.success;
    if (result.success) {
      this.validationNotices = [];
    }

    this.#showTimer = setTimeout(() => {
      if (!isLatest()) return;
      if (result.success) {
        this.#onSuccess?.(value);
      } else {
        this.validationNotices = result.issues.map(i => createNotice(i.message, LEVEL.WARNING));
      }
    }, SHOW_DELAY);
  }
}

function computeClasses(notices) {
  return notices.map(n => n.level)
      .filter((v, i, s) => s.indexOf(v) === i && v !== LEVEL.INFO)
      .join(' ');
}
