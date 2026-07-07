<script>
  import {createValidationField} from '$lib/scripts/service/validation.service.svelte.js';
  import {emailSchema, passwordRepeatSchema, passwordSchema, usernameSchema} from '$lib/scripts/util/validation.util.js';
  import PreviewInput from '$lib/components/ui/PreviewInput.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';

  let { user } = $props();

  const name = createValidationField(usernameSchema(), user.name);
  const email = createValidationField(emailSchema(), user.email);
  const password = createValidationField(passwordSchema(), '');
  const passwordRepeat = createValidationField(passwordRepeatSchema(() => password.value), '');

  let isPasswordEdit = $state(false);
</script>

<PreviewInput id="user-name"
              label="Имя пользователя"
              classes={name.validationClasses}
              bind:value={name.value}/>
<Notice bind:notices={name.validationNotices}/>

<PreviewInput id="user-email"
              label="Электронная почта"
              classes={email.validationClasses}
              bind:value={email.value}/>
<Notice bind:notices={email.validationNotices}/>

<PreviewInput id="user-password"
              label="Пароль"
              type="password"
              placeholder="********"
              classes={password.validationClasses}
              bind:value={password.value}
              bind:isEditMode={isPasswordEdit}/>
<Notice bind:notices={password.validationNotices}/>

{#if isPasswordEdit}
  <PreviewInput id="user-password-repeat"
                label="Повторите пароль"
                type="password"
                placeholder="********"
                classes={passwordRepeat.validationClasses}
                bind:value={passwordRepeat.value}
                bind:isEditMode={isPasswordEdit}/>
  <Notice bind:notices={passwordRepeat.validationNotices}/>
{/if}
