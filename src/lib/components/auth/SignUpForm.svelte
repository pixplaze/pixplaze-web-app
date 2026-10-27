<script>
  import {getEmailSuggestions} from '$util/email.util.js';
  import {SignUpForm} from '$components/auth/SignUpForm.svelte.js';
  import Input from '$ui/inputs/Input.svelte';
  import Button from '$ui/buttons/Button.svelte';
  import Notice from '$ui/Notice.svelte';
  import InputAutocompletionWrapper from '$ui/inputs/InputAutocompletionWrapper.svelte';
  import {createNotice, LEVEL} from '$util/notice.util.js';

  const {
    inviteCode,
    onSubmit
  } = $props();

  // svelte-ignore state_referenced_locally
  const form = new SignUpForm(inviteCode);
  const fields = form.fields;

  async function onFormSubmit() {
    if (!form.isValid) return;
    form.clearNotices();
    try {
      await onSubmit(form.toRequest());
    } catch (e) {
      form.pushNotice(createNotice(e.message, LEVEL.ERROR));
    }
  }
</script>

<form onsubmit={e => {e.preventDefault(); onFormSubmit()}} class="auth-form content-box">
  <h1>Регистрация</h1>

  <Input id="user-name"
         label="Имя пользователя"
         placeholder="notch"
         classes={[fields.name.validationClasses, form.level].filter(Boolean).join(' ')}
         bind:value={fields.name.value}
         oninput={() => form.clearNotices()}/>
  <Notice bind:notices={fields.name.validationNotices}/>

  <InputAutocompletionWrapper bind:value={fields.email.value} getSuggestions={getEmailSuggestions}>
    {#snippet children({action})}
      <Input id="user-email"
             label="Электронная почта"
             placeholder="notch@email.com"
             classes={[fields.email.validationClasses, form.level].filter(Boolean).join(' ')}
             bind:value={fields.email.value}
             oninput={() => form.clearNotices()}
             {action}/>
    {/snippet}
  </InputAutocompletionWrapper>
  <Notice bind:notices={fields.email.validationNotices}/>

  <Input id="user-password"
         label="Пароль"
         type="password"
         placeholder="********"
         classes={[fields.password.validationClasses, form.level].filter(Boolean).join(' ')}
         bind:value={fields.password.value}
         oninput={() => form.clearNotices()}/>
  <Notice bind:notices={fields.password.validationNotices}/>

  <Input id="user-password-repeat"
         label="Повторите пароль"
         type="password"
         placeholder="********"
         classes={[fields.passwordRepeat.validationClasses, form.level].filter(Boolean).join(' ')}
         bind:value={fields.passwordRepeat.value}
         oninput={() => form.clearNotices()}/>
  <Notice bind:notices={fields.passwordRepeat.validationNotices}/>

  <Input id="user-invite-code"
         label="Код приглашения"
         maxlength="8"
         disabled={!!inviteCode}
         classes={[fields.inviteCode.validationClasses, form.level].filter(Boolean).join(' ')}
         bind:value={fields.inviteCode.value}
         oninput={() => form.clearNotices()}/>
  <Notice notices={form.inviteCodeNotices}/>
<!--  <Notice notices={fields.inviteCode.validationNotices}/>-->

  <Notice bind:notices={form.notices}/>
  <Button onclick={onFormSubmit} disabled={!form.isValid}>Зарегистрироваться</Button>
</form>

<style>
  :global {
    form.auth-form {
      > input,
      > div,
      > h1 {
        margin-bottom: var(--ui-spacing);
      }
    }
    @media screen and (max-width: 440px) {
      section {
        padding-left: 10px;
        padding-right: 10px;
      }
    }

    #user-invite-code {
      text-transform: uppercase;
    }
  }
</style>
