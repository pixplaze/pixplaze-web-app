/**
 * Базовый сервис формы: единый фасад над состоянием (стором) и схемами валидации.
 * Конкретные сервисы передают свой store и набор схем, а также реализуют toRequest().
 */
export class FormService {
  /**
   * @param {{data: object, isFormDataValid: boolean}} formSore реактивный store формы
   * @param {Record<string, unknown>} schemas valibot-схемы по имени поля
   */
  constructor(formSore, schemas) {
    this.formStore = formSore;
    this.schemas = schemas;
  }

  /**
   * Reactive-группа полей формы ({name, email, ...}) для биндингов.
   * Возвращает сам $state-прокси, поэтому доступ вида fields.email.value реактивен.
   */
  get fields() {
    return this.formStore.data;
  }

  /** Группа valibot-схем валидации по имени поля (статичны, не реактивны). */
  get validations() {
    return this.schemas;
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