<script>
  import {getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {createSignInFormService} from '$lib/scripts/service/form/signin.form.service.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import InputValidationWrapper from '$lib/components/ui/inputs/InputValidationWrapper.svelte';

  const {
    onSubmit
  } = $props();

  const signInFormService = createSignInFormService({
    username: '',
    password: ''
  });

  const fields = signInFormService.fields;
  const validations = signInFormService.validations;

  function onFormSubmit() {
    if (!signInFormService.isValid) {
      return;
    }

    onSubmit(signInFormService.toRequest());
  }
</script>

<form onsubmit={e => {e.preventDefault(); onFormSubmit()}} class="auth-form content-box">
  <h1>Вход</h1>

  <InputValidationWrapper bind:value={fields.username.value}
                          bind:isValid={fields.username.isValid}
                          schema={validations.username}>
    {#snippet children({validationClasses})}
      <InputAutocompletionWrapper bind:value={fields.username.value} getSuggestions={getUsernameSuggestions}>
        {#snippet children({action})}
          <Input id="user-name"
                 label="Имя пользователя"
                 placeholder="notch"
                 classes={validationClasses}
                 bind:value={fields.username.value}
                 {action}/>
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
             bind:value={fields.password.value}/>
    {/snippet}
  </InputValidationWrapper>

  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!signInFormService.isValid}>Войти</Button>
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