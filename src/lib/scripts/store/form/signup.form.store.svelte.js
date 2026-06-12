import {FormStore} from "$lib/scripts/store/form/form.store.svelte.js";

/**
 * Состояние формы регистрации = базовое состояние формы + уведомления по коду
 * приглашения. Базовый конструктор вызывается неявно (super(data)).
 */
class SignUpFormStore extends FormStore {
  inviteCodeNotices = $state([]);
}

export const createSignUpFormStore = (data) => new SignUpFormStore(data);