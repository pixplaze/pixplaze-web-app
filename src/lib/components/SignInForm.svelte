<script>
  import {getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {createSignInFormService} from '$lib/scripts/service/form/signin.form.service.js';
  import {requiredSchema, usernameSchema} from '$lib/scripts/util/validation.util.js';
  import {createValidationField} from '$lib/scripts/service/validation.service.svelte.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import Notice from "$lib/components/ui/Notice.svelte";

  const {
    onSubmit
  } = $props();

  const signInFormService = createSignInFormService({
    name: createValidationField(usernameSchema(), ''),
    password: createValidationField(requiredSchema(), ''),
  });

  const fields = signInFormService.fields;

  function onFormSubmit() {
    if (!signInFormService.isValid) {
      return;
    }

    onSubmit(signInFormService.toRequest());
  }
</script>

<form onsubmit={e => {e.preventDefault(); onFormSubmit()}} class="auth-form content-box">
  <h1>Вход</h1>

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

  <Input id="user-password"
         label="Пароль"
         type="password"
         placeholder="********"
         classes={` ${fields.password.validationClasses}`}
         bind:value={fields.password.value}/>
  <Notice bind:notices={fields.password.validationNotices}/>
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