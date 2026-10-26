import {maxLength, maxValue, minLength, minValue, number, pipe, string, trim} from "valibot";
import {Form} from '$lib/scripts/forms/form.svelte.js';
import {Field} from '$lib/scripts/forms/field.svelte.js';
import {hostSchema} from "$lib/scripts/util/validation.util.js";

/** Форма заявки на подключение сервера. */
export class ServerBidForm extends Form {
  constructor() {
    super({
      name: new Field(pipe(
          string(),
          trim(),
          minLength(3, 'Имя сервера должно быть длиннее 3 символов'),
          maxLength(32, 'Имя сервера должно быть короче 32 символов')
      )),
      host: new Field(hostSchema('Некорректный хост сервера, ожидался IP или доменное имя')),
      port: new Field(pipe(
          number(),
          minValue(1, 'Минимальный порт сервера - 1'),
          maxValue(65535, 'Максимальный порт сервера - 65535')
      ), {initial: 25565}),
    });
  }

  toRequest() {
    return {
      name: this.fields.name.value,
      host: this.fields.host.value,
      port: this.fields.port.value
    }
  }
}
