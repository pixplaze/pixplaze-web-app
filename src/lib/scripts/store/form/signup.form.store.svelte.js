import {isFormDataValid} from "$lib/scripts/service/form.service.js";

class SignUpFormStore {
  constructor(data) {
    this.data = $state(data);
    this.inviteCodeNotices = $state([]);
    this.isFormDataValid = $derived(isFormDataValid(this.data));
  }

  getSignUpFormData() {
    return $state.snapshot({
      username: this.data.name.value,
      email: this.data.email.value,
      password: this.data.password.value,
      inviteCode: this.data.inviteCode.value
    });
  }

}

export const createSignUpFormStore = (data) => new SignUpFormStore(data);