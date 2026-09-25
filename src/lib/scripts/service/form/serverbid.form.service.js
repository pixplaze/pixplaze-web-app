import {createFormData, createFormStore, FormService} from '$lib/scripts/service/form/form.service.js';
import {createValidationField} from "$lib/scripts/service/validation.service.svelte.js";
import {boolean, maxLength, maxValue, minLength, minValue, number, pipe, string, trim} from "valibot";
import {hostSchema} from "$lib/scripts/util/validation.util.js";

export class ServerBidFormService extends FormService {
  constructor() {
    const name = createValidationField(pipe(
        string(),
        trim(),
        minLength(3, 'Имя сервера должно быть длиннее 3 символов'),
        maxLength(32, 'Имя сервера должно быть короче 32 символов')
    ), '');
    const host = createValidationField(hostSchema('Некорректный хост сервера, ожидался IP или доменное имя'), '');
    const port = createValidationField(pipe(
        number(),
        minValue(1, 'Минимальный порт сервера - 1'),
        maxValue(65535, 'Максимальный порт сервера - 65535')
    ), 25565);
    const integration = createValidationField(boolean(),false);

    super(createFormStore({name, host, port, integration}));
  }

  get withoutIntegration() {
    return !this.fields.integration.value;
  }

  set withoutIntegration(value) {
    this.fields.integration.value = !value;
  }

  toRequest() {
    return {
      name: this.fields.name.value,
      host: this.fields.host.value,
      port: this.fields.port.value,
      integration: this.fields.integration.value
    }
  }
}