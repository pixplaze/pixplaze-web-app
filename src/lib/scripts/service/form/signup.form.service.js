import {createSignUpFormStore} from "$lib/scripts/store/form/signup.form.store.svelte.js";
import {createFormData} from "$lib/scripts/service/form.service.js";
import {BaseFormService} from "$lib/scripts/service/form/base.form.service.js";
import {emailSchema, inviteCodeSchema, passwordRepeatSchema, passwordSchema} from "$lib/scripts/service/form/validations.js";
import {voucherService} from "$lib/scripts/service/voucher.service.js";
import {noticeService} from "$lib/scripts/service/notice.service.js";
import {LEVEL} from "$lib/scripts/util/notice.util.js";

/**
 * Бизнес-логика формы регистрации: набор схем валидации, формирование DTO
 * и побочные эффекты (сообщение по коду приглашения). Общий доступ к состоянию
 * и схемам предоставляет BaseFormService.
 */
class SignUpFormService extends BaseFormService {
  constructor(data) {
    const store = createSignUpFormStore(createFormData(data));
    super(store, {
      email: emailSchema(),
      password: passwordSchema(),
      passwordRepeat: passwordRepeatSchema(() => store.data.password.value),
      inviteCode: inviteCodeSchema()
    });
  }

  /** Уведомления по коду приглашения (read-only). */
  get inviteCodeNotices() {
    return this.store.inviteCodeNotices;
  }

  /** Закрыть плашку: владелец массива уведомлений — сервис, не компонент Notice. */
  closeInviteCodeNotice(id) {
    this.store.inviteCodeNotices = this.store.inviteCodeNotices.filter(n => n.id !== id);
  }

  async showInviteCodeNotice(code) {
    const message = await voucherService.getInviteCodeMessage(code);
    this.store.inviteCodeNotices = [noticeService.create(message, LEVEL.INFO)];
  }

  /** DTO для запроса регистрации: name → username, passwordRepeat отбрасывается. */
  toRequest() {
    const {data} = this.store;
    return {
      username: data.name.value,
      email: data.email.value,
      password: data.password.value,
      inviteCode: data.inviteCode.value
    };
  }
}

export const createSignUpFormService = (data) => new SignUpFormService(data);