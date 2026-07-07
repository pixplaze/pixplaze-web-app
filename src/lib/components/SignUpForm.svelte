<script>
  import {getEmailSuggestions, getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {createSignUpFormService} from '$lib/scripts/service/form/signup.form.service.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';

  const {
    inviteCode,
    onSubmit
  } = $props();

  const signUpFormService = createSignUpFormService(inviteCode);
  const fields = signUpFormService.fields;

  function onFormSubmit() {
    if (!signUpFormService.isValid) {
      return;
    }

    onSubmit(signUpFormService.toRequest());
  }
</script>

<form onsubmit={e => {e.preventDefault(); onFormSubmit()}} class="auth-form content-box">
  <h1>Регистрация</h1>

  <InputAutocompletionWrapper bind:value={fields.name.value} getSuggestions={getUsernameSuggestions}>
    {#snippet children({action})}
      <Input id="user-name"
             label="Имя пользователя"
             placeholder="notch"
             classes={fields.name.validationClasses}
             bind:value={fields.name.value}
             {action}/>
    {/snippet}
  </InputAutocompletionWrapper>
  <Notice bind:notices={fields.name.validationNotices}/>

  <InputAutocompletionWrapper bind:value={fields.email.value} getSuggestions={getEmailSuggestions}>
    {#snippet children({action})}
      <Input id="user-email"
             label="Электронная почта"
             placeholder="notch@email.com"
             classes={fields.email.validationClasses}
             bind:value={fields.email.value}
             {action}/>
    {/snippet}
  </InputAutocompletionWrapper>
  <Notice bind:notices={fields.email.validationNotices}/>

  <Input id="user-password"
         label="Пароль"
         type="password"
         placeholder="********"
         classes={fields.password.validationClasses}
         bind:value={fields.password.value}/>
  <Notice bind:notices={fields.password.validationNotices}/>

  <Input id="user-password-repeat"
         label="Повторите пароль"
         type="password"
         placeholder="********"
         classes={fields.passwordRepeat.validationClasses}
         bind:value={fields.passwordRepeat.value}/>
  <Notice bind:notices={fields.passwordRepeat.validationNotices}/>

  <Input id="user-invite-code"
         label="Код приглашения"
         maxlength="8"
         disabled={!!inviteCode}
         classes={fields.inviteCode.validationClasses}
         bind:value={fields.inviteCode.value}/>
  <Notice notices={signUpFormService.inviteCodeNotices}/>

  <Button onclick={onFormSubmit} disabled={!signUpFormService.isValid}>Зарегистрироваться</Button>
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
  }
</style>
