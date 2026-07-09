import {FormStore} from "$lib/scripts/store/form/form.store.svelte.js";
import {maxLevel} from "$lib/scripts/service/notice.service.js";

/**
 * Базовый сервис формы: единый фасад над состоянием (стором) и схемами валидации.
 * Конкретные сервисы передают свой store и набор схем, а также реализуют toRequest().
 */
export class FormService {
  /**
   * @param {{data: object, isFormDataValid: boolean}} formSore реактивный store формы
   */
  constructor(formSore) {
    this.formStore = formSore;
  }

  pushNotice(notice) {
    this.formStore.formNotices.push(notice);
  }

  clearNotices() {
    this.formStore.formNotices = [];
  }

  get notices() {
    return this.formStore.formNotices;
  }

  get level() {
    return maxLevel(this.formStore.formNotices);
  }

  /**
   * Reactive-группа полей формы ({name, email, ...}) для биндингов.
   * Возвращает сам $state-прокси, поэтому доступ вида fields.email.value реактивен.
   */
  get fields() {
    return this.formStore.data;
  }

  /** Валидность формы (read-only, реактивно через $derived стора). */
  get isValid() {
    return this.formStore.isFormDataValid;
  }
}

export function createFormData(data) {
  const formStructure = {};

  // Динамически перебираем все ключи исходного объекта
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue;
    }

    if (
        data[key] != null &&
        ('isValid' in Object(data[key]) || 'value' in Object(data[key]))
    ) {
      formStructure[key] = data[key];
      continue;
    }

    formStructure[key] = {
      value: data[key],
      isValid: false,
    };
  }

  return formStructure;
}

export function createFormStore(data) {
  return new FormStore(createFormData(data));
}

export function createFormService(data) {
  return new FormService(createFormStore(data));
}

export function isPropertyValid(property) {
  return property.isValid;
}

export function isFormDataValid(data) {
  for (const key in data) {
    if (!Object.prototype.hasOwnProperty.call(data, key)) {
      continue;
    }
    if (!isPropertyValid(data[key])) {
      return false;
    }
  }

  return true;
}