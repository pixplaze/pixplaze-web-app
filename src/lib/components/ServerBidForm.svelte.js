import {boolean, check, maxLength, maxValue, minLength, minValue, number, pipe, string, trim} from "valibot";
import {Form} from '$lib/scripts/forms/form.svelte.js';
import {Field} from '$lib/scripts/forms/field.svelte.js';
import {hostSchema} from "$lib/scripts/util/validation.util.js";

const MINECRAFT_USERNAME = /^[A-Za-z0-9_]{3,16}$/;

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
      // Ник проверяется по формату; обязательность зависит от интеграции и проверяется в isValid.
      ownerUsername: new Field(pipe(
          string(),
          trim(),
          check(value => value === '' || MINECRAFT_USERNAME.test(value), 'Ник Minecraft: от 3 до 16 латинских букв, цифр или _')
      )),
      integration: new Field(boolean(), {initial: false}),
    });
  }

  /** С интеграцией нужен ник владельца: при регистрации плагином его ищут среди операторов. */
  get ownerUsernameRequired() {
    return this.fields.integration.value && this.fields.ownerUsername.value.trim() === '';
  }

  get isValid() {
    return super.isValid && !this.ownerUsernameRequired;
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
      ownerUsername: this.fields.integration.value ? this.fields.ownerUsername.value.trim() : null,
      isIntegration: this.fields.integration.value
    }
  }
}
