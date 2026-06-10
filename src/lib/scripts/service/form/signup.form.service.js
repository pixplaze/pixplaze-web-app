import {createSignUpFormStore} from "$lib/scripts/store/form/signup.form.store.svelte.js";
import {createFormData} from "$lib/scripts/service/form.service.js";
import {check, checkAsync, email, minLength, pipe, pipeAsync, regex, string} from "valibot";
import {voucherService} from "$lib/scripts/service/voucher.service.js";
import {noticeService} from "$lib/scripts/service/notice.service.js";
import {LEVEL} from "$lib/scripts/util/notice.util.js";

class SignupFormService {
  constructor(data) {
    this.signUpFormStore = createSignUpFormStore(createFormData(data));

    this.emailValidationSchema = pipe(
        string(),
        email('Электронная почта не соответствует маске')
    );
    this.passwordValidationSchema = pipe(
        string(),
        minLength(8, 'Пароль должен быть длиннее 8 символов'),
        regex(/[a-z]/, 'Пароль должен содержать хотя бы один символ в нижнем регистре'),
        regex(/[A-Z]/, 'Пароль должен содержать хотя бы один символ в верхнем регистре'),
        regex(/[0-9]/, 'Пароль должен содержать хотя бы один символ цифры'),
        regex(/[^a-zA-Z0-9]/, 'Пароль должен содержать хотя бы один спецсимвол')
    );
    this.repeatPasswordValidationSchema = pipe(
        string(),
        check((r) => r === this.signUpFormStore.data.password.value, 'Пароли должны совпадать')
    );
    this.inviteCodeValidationSchema = pipeAsync(
        string(),
        minLength(8, 'Код приглашения должен состоять из 8 символов'),
        checkAsync(async code => await voucherService.isInviteCodeValid(code), 'Неверный код приглашения')
    );
  }

  async getInviteCodeMessage(code) {
    const message = await voucherService.getInviteCodeMessage(code);
    const notice = noticeService.create(message, LEVEL.INFO);
    this.signUpFormStore.inviteCodeNotices.push(notice); // TODO !!!
  }

  async isInviteCodeValid(code) {
    return await voucherService.isInviteCodeValid(code);
  }
}

export const createSignUpFormService = (data) => new SignupFormService(data);
// export const createSignUpFormStore = (data) => new SignUpFormStore(data);