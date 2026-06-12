/**
 * Базовый сервис формы: единый фасад над состоянием (стором) и схемами валидации.
 * Конкретные сервисы передают свой store и набор схем, а также реализуют toRequest().
 */
export class BaseFormService {
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