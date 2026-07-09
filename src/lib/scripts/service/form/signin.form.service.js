import {createFormStore, FormService} from '$lib/scripts/service/form/form.service.js';

/**
 * Бизнес-логика формы входа. Переиспользует базовый сервис и общие схемы
 * валидации (username, password). Своя только схема данных и DTO.
 */
class SignInFormService extends FormService {
  constructor(data) {
    super(createFormStore(data));
  }

  clear() {
    this.fields.name.value = '';
    this.fields.password.value = '';
  }

  /** DTO для запроса входа. */
  toRequest() {
    return {
      username: this.fields.name.value,
      password: this.fields.password.value
    };
  }
}

export const createSignInFormService = (data) => new SignInFormService(data);