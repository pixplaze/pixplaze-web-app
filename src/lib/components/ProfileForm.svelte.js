import {Form} from "$lib/scripts/forms/form.svelte.js";
import {Field} from "$lib/scripts/forms/field.svelte.js";
import {
  emailSchema,
  passwordRepeatSchema,
  passwordSchema,
  requiredSchema,
  usernameSchema
} from "$lib/scripts/util/validation.util.js";

/**
 * Форма профиля. Поля правятся по отдельности: имя, email и пароль (новый, повтор и текущий —
 * одной группой). Проверяются и отправляются только поля в режиме правки; выход из режима
 * возвращает их значения.
 */
export class ProfileForm extends Form {
  editing = $state({name: false, email: false, password: false});

  constructor(user) {
    const password = new Field(passwordSchema());
    super({
      name: new Field(usernameSchema(), {initial: user.name}),
      email: new Field(emailSchema(), {initial: user.email ?? ''}),
      password,
      passwordRepeat: new Field(passwordRepeatSchema(() => password.value), {dependsOn: password}),
      // Старый пароль мог не проходить нынешние правила — проверяем только наличие
      currentPassword: new Field(requiredSchema('Введите текущий пароль')),
    });
  }

  /** Хотя бы одно поле в режиме правки — показываем кнопку сохранения. */
  get isEditing() {
    return Object.values(this.editing).some(Boolean);
  }

  /** Валидны все поля в режиме правки и хоть что-то изменилось. */
  get isValid() {
    const fields = this.#editedFields();
    return fields.length > 0
        && fields.every(field => field.isValid)
        && fields.some(field => field.isChanged);
  }

  /** Войти в режим правки группы или выйти из него; выход возвращает значения группы. */
  setEditing(group, isEditing) {
    this.editing[group] = isEditing;
    if (!isEditing) {
      this.#groupFields(group).forEach(field => field.clear());
      this.clearNotices();
    }
  }

  /** Сохранено: новые значения становятся исходными, режимы правки закрываются. */
  commit() {
    const {name, email, password, passwordRepeat, currentPassword} = this.fields;
    name.commit();
    email.commit();
    [password, passwordRepeat, currentPassword].forEach(field => field.clear());
    this.editing = {name: false, email: false, password: false};
  }

  /** Только изменённые поля: остальные сервер оставит как есть. */
  toRequest() {
    const {name, email, password, currentPassword} = this.fields;
    const request = {};
    if (this.editing.name && name.isChanged) request.username = name.value;
    if (this.editing.email && email.isChanged) request.email = email.value;
    if (this.editing.password) {
      request.password = password.value;
      request.currentPassword = currentPassword.value;
    }
    return request;
  }

  #editedFields() {
    return Object.keys(this.editing)
        .filter(group => this.editing[group])
        .flatMap(group => this.#groupFields(group));
  }

  #groupFields(group) {
    const {name, email, password, passwordRepeat, currentPassword} = this.fields;
    return {
      name: [name],
      email: [email],
      password: [password, passwordRepeat, currentPassword]
    }[group];
  }
}
