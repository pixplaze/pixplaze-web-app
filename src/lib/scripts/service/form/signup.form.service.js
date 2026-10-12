import {createSignUpFormStore} from "$lib/scripts/store/form/signup.form.store.svelte.js";
import {FormService, createFormData} from "$lib/scripts/service/form/form.service.js";
import {
  emailSchema,
  inviteCodeSchema,
  passwordRepeatSchema,
  passwordSchema,
  usernameSchema
} from "$lib/scripts/util/validation.util.js";
import {createDependentValidationField, createValidationField} from "$lib/scripts/service/validation.service.svelte.js";
import {voucherService} from "$lib/scripts/service/voucher.service.js";
import {noticeService} from "$lib/scripts/service/notice.service.js";
import {LEVEL} from "$lib/scripts/util/notice.util.js";

class SignUpFormService extends FormService {
  constructor(inviteCode) {
    const name = createValidationField(usernameSchema(), '');
    const email = createValidationField(emailSchema(), '');
    const password = createValidationField(passwordSchema(), '');
    const passwordRepeat = createDependentValidationField(
      passwordRepeatSchema(() => password.value), () => password.value
    );
    const code = createValidationField(inviteCodeSchema(), inviteCode ?? '', v => this.showInviteCodeNotice(v));

    const store = createSignUpFormStore(
      createFormData({ name, email, password, passwordRepeat, inviteCode: code })
    );
    super(store);
  }

  get inviteCodeNotices() {
    return this.formStore.inviteCodeNotices;
  }

  async showInviteCodeNotice(code) {
    const message = await voucherService.getInviteCodeMessage(code);
    this.formStore.inviteCodeNotices = [noticeService.create(message, LEVEL.INFO)];
  }

  toRequest() {
    const {data} = this.formStore;
    return {
      username: data.name.value,
      email: data.email.value,
      password: data.password.value,
      inviteCode: data.inviteCode.value
    };
  }
}

export const createSignUpFormService = (inviteCode) => new SignUpFormService(inviteCode);
