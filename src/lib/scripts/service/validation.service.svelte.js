import {parseAsync} from "valibot";
import {noticeService} from "$lib/scripts/service/notice.service.js";
import {LEVEL} from "$lib/scripts/util/notice.util.js";
import {ValidationStore} from "$lib/scripts/store/validation.store.svelte.js";

class ValidationService {
  #schema;
  #store;
  #onSuccess = null;

  constructor(schema, value, onSuccess) {
    this.#schema = schema;
    this.#store = new ValidationStore((value) => this.validate(value), value);
    this.#onSuccess = onSuccess;
  }

  async validate(value) {
    try {
      await parseAsync(this.#schema, value);
      this.#store.isValid = true;
      this.#store.validationNotices = [];
      await this.#onSuccess?.(value);
    } catch (error) {
      this.#store.isValid = false;
      this.#store.validationNotices = error.issues.map(i => noticeService.create(i.message, LEVEL.WARNING));
    }
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

export const createValidationService = (schema) => new ValidationService(schema);

export const createValidationField = (schema, initialValue = '', onSuccess = value => {}) => {
  return new ValidationService(schema, initialValue, onSuccess);
};
