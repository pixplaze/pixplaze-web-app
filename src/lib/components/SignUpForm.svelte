<script>
  import {getEmailSuggestions, getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {createSignUpFormService} from '$lib/scripts/service/form/signup.form.service.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import InputValidationWrapper from '$lib/components/ui/inputs/InputValidationWrapper.svelte';

  const {
    inviteCode,
    onSubmit
  } = $props();

  const signUpFormService = createSignUpFormService({
    name: {value: '', isValid: true},
    email: '',
    password: '',
    passwordRepeat: '',
    inviteCode: {value: inviteCode, isValid: !!inviteCode}
  });

  const fields = signUpFormService.fields;
  const validations = signUpFormService.validations;

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
             bind:value={fields.name.value}
             {action}
      />
    {/snippet}
  </InputAutocompletionWrapper>

  <InputValidationWrapper bind:value={fields.email.value}
                          bind:isValid={fields.email.isValid}
                          schema={validations.email}>
    {#snippet children({validationClasses})}
    <InputAutocompletionWrapper bind:value={fields.email.value}
                                getSuggestions={getEmailSuggestions}>
      {#snippet children({action})}
        <Input id="user-email"
               label="Электронная почта"
               placeholder="notch@email.com"
               classes={validationClasses}
               action={action}
               bind:value={fields.email.value}/>
      {/snippet}
    </InputAutocompletionWrapper>
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={validations.password}
                          bind:value={fields.password.value}
                          bind:isValid={fields.password.isValid}>
    {#snippet children({validationClasses})}
      <Input id="user-password"
             label="Пароль"
             type="password"
             placeholder="********"
             classes={` ${validationClasses}`}
             bind:value={fields.password.value}
      />
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={validations.passwordRepeat}
                          bind:value={fields.passwordRepeat.value}
                          bind:isValid={fields.passwordRepeat.isValid}>
    {#snippet children({validationClasses})}
      <Input id="user-password-repeat"
             label="Повторите пароль"
             type="password"
             placeholder="********"
             classes={` ${validationClasses}`}
             bind:value={fields.passwordRepeat.value}/>
    {/snippet}
  </InputValidationWrapper>
  <InputValidationWrapper schema={validations.inviteCode}
                          onSuccess={(v) => signUpFormService.showInviteCodeNotice(v)}
                          bind:value={fields.inviteCode.value}
                          bind:isValid={fields.inviteCode.isValid}>
    {#snippet children({validationClasses})}
      <Input id="user-invite-code"
             label="Код приглашения"
             maxlength="8"
             disabled={!!inviteCode}
             classes={` ${validationClasses}`}
             bind:value={fields.inviteCode.value}/>
    {/snippet}
  </InputValidationWrapper>
  <Notice notices={signUpFormService.inviteCodeNotices}
          onClose={(id) => signUpFormService.closeInviteCodeNotice(id)}/>
  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!signUpFormService.isValid}>Зарегистрироваться</Button>
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
  }
</style>