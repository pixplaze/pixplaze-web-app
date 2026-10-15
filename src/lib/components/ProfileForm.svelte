<script>
  import {ProfileForm} from './ProfileForm.svelte.js';
  import {profilesApi} from '$lib/scripts/api/profiles.api.js';
  import {auth} from '$lib/scripts/auth.svelte.js';
  import {notifications} from '$lib/scripts/notifications.svelte.js';
  import {createNotice, LEVEL} from '$lib/scripts/util/notice.util.js';
  import PreviewInput from '$lib/components/ui/PreviewInput.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';

  let { user } = $props();

  // svelte-ignore state_referenced_locally
  const form = new ProfileForm(user);
  const fields = form.fields;

  let isSubmitting = $state(false);

  /** Привязка режима правки группы полей к PreviewInput. */
  const editMode = (group) => [
    () => form.editing[group],
    (isEditing) => form.setEditing(group, isEditing)
  ];
  const [isNameEdit, setNameEdit] = editMode('name');
  const [isEmailEdit, setEmailEdit] = editMode('email');
  const [isPasswordEdit, setPasswordEdit] = editMode('password');

  async function onFormSubmit() {
    if (!form.isValid || isSubmitting) return;
    form.clearNotices();
    isSubmitting = true;
    try {
      await profilesApi.update(user.id, form.toRequest());
      form.commit();
      notifications.info('Профиль сохранён');
      // Имя и email лежат в access-токене: новый токен принесёт их в currentUser
      await auth.refresh();
    } catch (e) {
      form.pushNotice(createNotice(e.message, LEVEL.ERROR));
    } finally {
      isSubmitting = false;
    }
  }
</script>

<PreviewInput id="user-name"
              label="Имя пользователя"
              classes={fields.name.validationClasses}
              bind:value={fields.name.value}
              bind:isEditMode={isNameEdit, setNameEdit}
              oninput={() => form.clearNotices()}/>
<Notice bind:notices={fields.name.validationNotices}/>

<PreviewInput id="user-email"
              label="Электронная почта"
              classes={fields.email.validationClasses}
              bind:value={fields.email.value}
              bind:isEditMode={isEmailEdit, setEmailEdit}
              oninput={() => form.clearNotices()}/>
<Notice bind:notices={fields.email.validationNotices}/>

<PreviewInput id="user-password"
              label="Пароль"
              type="password"
              placeholder="********"
              classes={fields.password.validationClasses}
              bind:value={fields.password.value}
              bind:isEditMode={isPasswordEdit, setPasswordEdit}
              oninput={() => form.clearNotices()}/>
<Notice bind:notices={fields.password.validationNotices}/>

{#if form.editing.password}
  <PreviewInput id="user-password-repeat"
                label="Повторите пароль"
                type="password"
                placeholder="********"
                classes={fields.passwordRepeat.validationClasses}
                bind:value={fields.passwordRepeat.value}
                bind:isEditMode={isPasswordEdit, setPasswordEdit}
                oninput={() => form.clearNotices()}/>
  <Notice bind:notices={fields.passwordRepeat.validationNotices}/>

  <PreviewInput id="user-current-password"
                label="Текущий пароль"
                type="password"
                placeholder="********"
                classes={fields.currentPassword.validationClasses}
                bind:value={fields.currentPassword.value}
                bind:isEditMode={isPasswordEdit, setPasswordEdit}
                oninput={() => form.clearNotices()}/>
  <Notice bind:notices={fields.currentPassword.validationNotices}/>
{/if}

{#if form.isEditing}
  <div>
    <Notice bind:notices={form.notices}/>
    <Button onclick={onFormSubmit} disabled={!form.isValid || isSubmitting}>Сохранить</Button>
  </div>
{/if}
