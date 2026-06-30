/**
 * Базовый сервис формы: единый фасад над состоянием (стором) и схемами валидации.
 * Конкретные сервисы передают свой store и набор схем, а также реализуют toRequest().
 */
export class FormService {
  /**
   * @param {{data: object, isFormDataValid: boolean}} store реактивный store формы
   * @param {Record<string, unknown>} schemas valibot-схемы по имени поля
   */
  constructor(store, schemas) {
    this.store = store;
    this.schemas = schemas;
  }

  /**
   * Reactive-группа полей формы ({name, email, ...}) для биндингов.
   * Возвращает сам $state-прокси, поэтому доступ вида fields.email.value реактивен.
   */
  get fields() {
    return this.store.data;
  }

  /** Группа valibot-схем валидации по имени поля (статичны, не реактивны). */
  get validations() {
    return this.schemas;
  }

  /** Валидность формы (read-only, реактивно через $derived стора). */
  get isValid() {
    return this.store.isFormDataValid;
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
        Object.prototype.hasOwnProperty.call(data[key], 'isValid') ||
        Object.prototype.hasOwnProperty.call(data[key], 'value')
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

export function isPropertyValid(property) {
  return property.isValid && !!property.value && !!property.value.trim();
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