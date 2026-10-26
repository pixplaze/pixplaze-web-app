import {safeParse, safeParseAsync} from "valibot";
import {createNotice, LEVEL} from "$lib/scripts/util/notice.util.js";
import {createDebounce} from "$lib/scripts/util/utils.js";

/** Пауза ввода, после которой значение проверяется. */
const VALIDATE_DELAY = 500;

const isEmpty = (v) => v === '' || v === null || v === undefined;

/**
 * Поле формы с валидацией по схеме valibot. Значение проверяется после паузы ввода
 * ({@link VALIDATE_DELAY}) — так асинхронная проверка (запрос) не уходит на каждую букву.
 * До конца паузы и проверки поле невалидно; затем выставляются {@link isValid} и ошибки,
 * при успехе вызывается onSuccess. Ответ по устаревшему значению отбрасывается (дебаунс
 * завершает вытесненную проверку AbortError).
 *
 * Зависимое поле (повтор пароля) создаётся с `dependsOn`: смена значения того поля
 * перепроверяет зависимое.
 *
 * `normalize` приводит значение к хранимому виду (регистр, пробелы) до сохранения и проверки —
 * и при вводе, и для `initial`; схема, onSuccess и {@link value} видят уже приведённое.
 */
export class Field {
  isValid = $state(false);
  validationNotices = $state([]);
  validationClasses = $derived(computeClasses(this.validationNotices));

  #value = $state();
  #initial;
  #schema;
  #onSuccess;
  #normalize;
  #dependents = [];
  #debounce = createDebounce((value) => this.#schema.async
      ? safeParseAsync(this.#schema, value)
      : safeParse(this.#schema, value), VALIDATE_DELAY);

  /**
   * @param {object} schema схема valibot
   * @param {{initial?: any, onSuccess?: (value) => any, dependsOn?: Field, normalize?: (value) => any}} [options]
   */
  constructor(schema, {initial = '', onSuccess, dependsOn, normalize = value => value} = {}) {
    this.#schema = schema;
    this.#normalize = normalize;
    this.#initial = normalize(initial);
    this.#onSuccess = onSuccess;
    this.#value = this.#initial;
    dependsOn?.#dependents.push(this);
    this.#validate(this.#value);
  }

  get value() {
    return this.#value;
  }

  set value(value) {
    this.#value = this.#normalize(value);
    this.#validate(this.#value);
    this.#dependents.forEach(field => field.revalidate());
  }

  /** Перепроверить текущее значение (например, изменилось поле, от которого зависит это). */
  revalidate() {
    this.#validate(this.#value);
  }

  /** Значение отличается от исходного. */
  get isChanged() {
    return this.#value !== this.#initial;
  }

  clear() {
    this.value = this.#initial;
  }

  /** Сделать текущее значение исходным (например, после сохранения). */
  commit() {
    this.#initial = this.#value;
  }

  async #validate(value) {
    this.isValid = false;

    if (isEmpty(value)) {
      this.#debounce.cancel();
      this.validationNotices = [];
      return;
    }

    let result;
    try {
      result = await this.#debounce.run(value);
    } catch (e) {
      if (e.name === 'AbortError') return;
      throw e;
    }

    this.isValid = result.success;
    if (result.success) {
      this.validationNotices = [];
      this.#onSuccess?.(value);
    } else {
      this.validationNotices = result.issues.map(i => createNotice(i.message, LEVEL.WARNING));
    }
  }
}

function computeClasses(notices) {
  return notices.map(n => n.level)
      .filter((v, i, s) => s.indexOf(v) === i && v !== LEVEL.INFO)
      .join(' ');
}
