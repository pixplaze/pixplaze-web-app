import {createFormData, FormService} from '$lib/scripts/service/form/form.service.js';
import {FormStore} from '$lib/scripts/store/form/form.store.svelte.js';

/**
 * Бизнес-логика формы входа. Переиспользует базовый сервис и общие схемы
 * валидации (username, password). Своя только схема данных и DTO.
 */
class SignInFormService extends FormService {
  constructor(data) {
    super(new FormStore(createFormData(data)), {});
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