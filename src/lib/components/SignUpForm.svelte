<script>
  import {getEmailSuggestions, getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {createSignUpFormService} from '$lib/scripts/service/form/signup.form.service.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import Delimiter from '$lib/components/ui/Delimiter.svelte';
  import InputValidationWrapper from '$lib/components/ui/inputs/InputValidationWrapper.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';

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

  const signUpFormStore = signUpFormService.signUpFormStore;

  function onFormSubmit() {
    if (!signUpFormStore.isFormDataValid) {
      return;
    }

    onSubmit(signUpFormStore.getSignUpFormData());
  }
</script>

<form onsubmit={e => {e.preventDefault(); onSubmit()}} class="auth-form content-box">
  <h1 class="content-line">Регистрация</h1>

  <InputAutocompletionWrapper bind:value={signUpFormStore.data.name.value} getSuggestions={getUsernameSuggestions}>
    {#snippet children({action})}
      <Input id="user-name"
             label="Имя пользователя"
             placeholder="notch"
             bind:value={signUpFormStore.data.name.value}
             {action}
      />
    {/snippet}
  </InputAutocompletionWrapper>

  <InputValidationWrapper bind:value={signUpFormStore.data.email.value}
                          bind:isValid={signUpFormStore.data.email.isValid}
                          schema={signUpFormService.emailValidationSchema}>
    {#snippet children({inputClasses})}
    <InputAutocompletionWrapper bind:value={signUpFormStore.data.email.value}
                                getSuggestions={getEmailSuggestions}>
      {#snippet children({action})}
        <Input id="user-email"
               label="Электронная почта"
               placeholder="notch@email.com"
               classes={inputClasses}
               action={action}
               bind:value={signUpFormStore.data.email.value}/>
      {/snippet}
    </InputAutocompletionWrapper>
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={signUpFormService.passwordValidationSchema}
                          bind:value={signUpFormStore.data.password.value}
                          bind:isValid={signUpFormStore.data.password.isValid}>
    {#snippet children({inputClasses})}
      <Input id="user-password"
             label="Пароль"
             type="password"
             placeholder="********"
             classes={` ${inputClasses}`}
             bind:value={signUpFormStore.data.password.value}
      />
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={signUpFormService.repeatPasswordValidationSchema}
                          bind:value={signUpFormStore.data.passwordRepeat.value}
                          bind:isValid={signUpFormStore.data.passwordRepeat.isValid}>
    {#snippet children({inputClasses})}
      <Input id="user-password-repeat"
             label="Повторите пароль"
             type="password"
             placeholder="********"
             classes={` ${inputClasses}`}
             bind:value={signUpFormStore.data.passwordRepeat.value}/>
    {/snippet}
  </InputValidationWrapper>
  <InputValidationWrapper schema={signUpFormService.inviteCodeValidationSchema}
                          onSuccess={async (v) => await signUpFormService.getInviteCodeMessage(v)}
                          bind:value={signUpFormStore.data.inviteCode.value}
                          bind:isValid={signUpFormStore.data.inviteCode.isValid}>
    {#snippet children({inputClasses})}
      <Input id="user-invite-code"
             label="Код приглашения"
             maxlength="8"
             disabled={inviteCode}
             classes={` ${inputClasses}`}
             bind:value={signUpFormStore.data.inviteCode.value}/>
    {/snippet}
  </InputValidationWrapper>
  <Notice bind:notices={signUpFormStore.inviteCodeNotices}/>
  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!signUpFormStore.isFormDataValid}>Зарегистрироваться</Button>
  <Delimiter value="или"/>
</form>

<style>
  :global {
    form.auth-form {
      > input,
      > div {
        margin-bottom: var(--ui-spacing);
      }
    }
  }
</style>