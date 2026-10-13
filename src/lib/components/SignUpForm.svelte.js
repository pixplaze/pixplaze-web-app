import {checkAsync, minLength, pipeAsync, string} from "valibot";
import {Form} from "$lib/scripts/forms/form.svelte.js";
import {Field} from "$lib/scripts/forms/field.svelte.js";
import {emailSchema, passwordRepeatSchema, passwordSchema, usernameSchema} from "$lib/scripts/util/validation.util.js";
import {vouchersApi} from "$lib/scripts/api/vouchers.api.js";
import {createNotice, LEVEL} from "$lib/scripts/util/notice.util.js";

const inviteCodeSchema = () => pipeAsync(
    string(),
    minLength(8, 'Код приглашения должен состоять из 8 символов'),
    checkAsync((code) => vouchersApi.isInviteCodeValid(code), 'Неверный код приглашения')
);

/** Форма регистрации: поля + сообщение к коду приглашения. */
export class SignUpForm extends Form {
  inviteCodeNotices = $state([]);

  constructor(inviteCode) {
    const password = new Field(passwordSchema());
    super({
      name: new Field(usernameSchema()),
      email: new Field(emailSchema()),
      password,
      passwordRepeat: new Field(passwordRepeatSchema(() => password.value), {dependsOn: password}),
      inviteCode: new Field(inviteCodeSchema(), {
        initial: inviteCode ?? '',
        onSuccess: code => this.#showInviteCodeNotice(code)
      }),
    });
  }

  async #showInviteCodeNotice(code) {
    const message = await vouchersApi.getInviteCodeMessage(code);
    this.inviteCodeNotices = [createNotice(message, LEVEL.INFO)];
  }

  toRequest() {
    return {
      username: this.fields.name.value,
      email: this.fields.email.value,
      password: this.fields.password.value,
      inviteCode: this.fields.inviteCode.value
    };
  }
}
