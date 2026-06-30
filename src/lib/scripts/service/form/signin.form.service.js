import {createSignInFormStore} from "$lib/scripts/store/form/signin.form.store.svelte.js";
import {requiredSchema} from "$lib/scripts/util/validation.util.js";
import {createFormData, FormService} from "$lib/scripts/service/form/form.service.js";

/**
 * Бизнес-логика формы входа. Переиспользует базовый сервис и общие схемы
 * валидации (username, password). Своя только схема данных и DTO.
 */
class SignInFormService extends FormService {
  constructor(data) {
    super(createSignInFormStore(createFormData(data)), {
      name: requiredSchema(),
      password: requiredSchema()
    });
  }

  /** DTO для запроса входа. */
  toRequest() {
    const {data} = this.store;
    return {
      username: data.name.value,
      password: data.password.value
    };
  }
}

export const createSignInFormService = (data) => new SignInFormService(data);