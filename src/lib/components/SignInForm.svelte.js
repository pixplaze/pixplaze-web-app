import {Form} from '$lib/scripts/forms/form.svelte.js';
import {Field} from '$lib/scripts/forms/field.svelte.js';
import {requiredSchema, usernameSchema} from '$lib/scripts/util/validation.util.js';

/** Форма входа. */
export class SignInForm extends Form {
  constructor() {
    super({
      name: new Field(usernameSchema()),
      password: new Field(requiredSchema()),
    });
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
