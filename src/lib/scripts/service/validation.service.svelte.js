import {safeParse, safeParseAsync} from "valibot";
import {noticeService} from "$lib/scripts/service/notice.service.js";
import {LEVEL} from "$lib/scripts/util/notice.util.js";
import {ValidationStore} from "$lib/scripts/store/validation.store.svelte.js";

/** Пауза ввода, после которой показываются новые ошибки и вызывается onSuccess. */
const SHOW_DELAY = 500;

const isEmpty = (v) => v === '' || v === null || v === undefined;

/**
 * Валидация поля. Значение проверяется сразу при каждом изменении — {@link isValid}
 * всегда описывает текущее значение. Показ результата отложен: ошибки исчезают сразу,
 * как только значение стало валидным, а новые появляются после паузы ввода
 * ({@link SHOW_DELAY}); тогда же вызывается onSuccess. Пока идёт асинхронная проверка,
 * поле невалидно; ответ по устаревшему значению отбрасывается.
 */
class ValidationService {
  #schema;
  #store;
  #onSuccess;
  #version = 0;
  #showTimer = null;

  constructor(schema, value, onSuccess, dependsOn = null) {
    this.#schema = schema;
    this.#onSuccess = onSuccess;
    this.#store = new ValidationStore((value) => this.validate(value), value, dependsOn);
  }

  async validate(value) {
    const version = ++this.#version;
    clearTimeout(this.#showTimer);

    if (isEmpty(value)) {
      this.#store.isValid = false;
      this.#store.validationNotices = [];
      return;
    }

    let result;
    if (this.#schema.async) {
      this.#store.isValid = false;
      result = await safeParseAsync(this.#schema, value);
      if (version !== this.#version) return;
    } else {
      result = safeParse(this.#schema, value);
    }

    this.#store.isValid = result.success;
    if (result.success) {
      this.#store.validationNotices = [];
    }

    this.#showTimer = setTimeout(() => {
      if (version !== this.#version) return;
      if (result.success) {
        this.#onSuccess?.(value);
      } else {
        this.#store.validationNotices = result.issues.map(i => noticeService.create(i.message, LEVEL.WARNING));
      }
    }, SHOW_DELAY);
  }

  clear() {
    this.#store.value = this.#store.initial;
  }

  set value(value) {
    this.#store.value = value;
  }

  get value() {
    return this.#store.value;
  }

  get isValid() {
    return this.#store.isValid;
  }

  get validationClasses() {
    return this.#store.validationClasses;
  }

  get validationNotices() {
    return this.#store.validationNotices;
  }
}

export const createValidationField = (schema, initialValue = '', onSuccess = value => {}) => {
  return new ValidationService(schema, initialValue, onSuccess);
};

/**
 * Поле, проверка которого зависит от другого значения (повтор пароля): перепроверяется
 * и при изменении своего значения, и при изменении {@link dependsOn}.
 * @param {() => any} dependsOn реактивный геттер значения, от которого зависит поле
 */
export const createDependentValidationField = (schema, dependsOn, initialValue = '') => {
  return new ValidationService(schema, initialValue, undefined, dependsOn);
};
