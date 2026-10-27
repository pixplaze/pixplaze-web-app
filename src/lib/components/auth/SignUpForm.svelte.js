import {checkAsync, minLength, pipeAsync, string} from "valibot";
import {Form} from "$scripts/forms/form.svelte.js";
import {Field} from "$scripts/forms/field.svelte.js";
import {emailSchema, passwordRepeatSchema, passwordSchema, usernameSchema} from "$util/validation.util.js";
import {vouchersApi} from "$api/vouchers.api.js";
import {createNotice, LEVEL} from "$util/notice.util.js";

const inviteCodeSchema = () => pipeAsync(
    string(),
    minLength(8, 'Код приглашения должен состоять из 8 символов'),
    checkAsync((code) => code.length < 8 || vouchersApi.isInviteCodeValid(code), 'Неверный код приглашения')
);

/** Форма регистрации: поля + сообщение к коду приглашения. */
export class SignUpForm extends Form {
  inviteCodeNotices = $derived([...this.fields.inviteCode.validationNotices]);

  constructor(inviteCode) {
    const password = new Field(passwordSchema());
    super({
      name: new Field(usernameSchema()),
      email: new Field(emailSchema()),
      password,
      passwordRepeat: new Field(passwordRepeatSchema(() => password.value), {dependsOn: password}),
      inviteCode: new Field(
        inviteCodeSchema(),
        {
          initial: inviteCode ?? '',
          normalize: code => code.toUpperCase(),
          onSuccess: code => this.#showInviteCodeNotice(code)
      }),
    });
  }

  async #showInviteCodeNotice(code) {
    const message = await vouchersApi.getInviteCodeMessage(code);
    this.inviteCodeNotices = [...this.inviteCodeNotices, createNotice(message, LEVEL.INFO)];
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
