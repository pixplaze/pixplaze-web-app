import {createSignInFormStore} from "$lib/scripts/store/form/signin.form.store.svelte.js";
import {createFormData} from "$lib/scripts/service/form.service.js";
import {BaseFormService} from "$lib/scripts/service/form/base.form.service.js";
import {requiredSchema, usernameSchema} from "$lib/scripts/service/form/validations.js";

/**
 * Бизнес-логика формы входа. Переиспользует базовый сервис и общие схемы
 * валидации (username, password). Своя только схема данных и DTO.
 */
class SignInFormService extends BaseFormService {
  constructor(data) {
    super(createSignInFormStore(createFormData(data)), {
      username: usernameSchema(),
      password: requiredSchema('Введите пароль')
    });
  }

  /** DTO для запроса входа. */
  toRequest() {
    const {data} = this.store;
    return {
      username: data.username.value,
      password: data.password.value
    };
  }
}

export const createSignInFormService = (data) => new SignInFormService(data);