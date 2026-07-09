<script>
  import {getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {createSignInFormService} from '$lib/scripts/service/form/signin.form.service.js';
  import {requiredSchema, usernameSchema} from '$lib/scripts/util/validation.util.js';
  import {createValidationField} from '$lib/scripts/service/validation.service.svelte.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import Notice from "$lib/components/ui/Notice.svelte";
  import {noticeService} from "$lib/scripts/service/notice.service.js";
  import {LEVEL} from "$lib/scripts/util/notice.util.js";

  const {
    onSubmit
  } = $props();

  const form = createSignInFormService({
    name: createValidationField(usernameSchema(), ''),
    password: createValidationField(requiredSchema(), ''),
  });

  const fields = form.fields;

  async function onFormSubmit() {
    if (!form.isValid) return;
    try {
      await onSubmit(form.toRequest());
    } catch (e) {
      form.pushNotice(noticeService.create(e.message, LEVEL.ERROR));
    }
  }
</script>

<form onsubmit={e => {e.preventDefault(); onFormSubmit()}} class="auth-form content-box">
  <h1>Вход</h1>

  <InputAutocompletionWrapper bind:value={fields.name.value} getSuggestions={getUsernameSuggestions}>
    {#snippet children({action})}
      <Input id="user-name"
             label="Имя пользователя"
             placeholder="notch"
             classes={[fields.name.validationClasses, form.level].filter(Boolean).join(' ')}
             bind:value={fields.name.value}
             oninput={() => form.clearNotices()}
             {action}/>
    {/snippet}
  </InputAutocompletionWrapper>
  <Notice bind:notices={fields.name.validationNotices}/>

  <Input id="user-password"
         label="Пароль"
         type="password"
         placeholder="********"
         classes={[fields.password.validationClasses, form.level].filter(Boolean).join(' ')}
         bind:value={fields.password.value}
         oninput={() => form.clearNotices()}/>
  <Notice bind:notices={fields.password.validationNotices}/>
  <Notice bind:notices={form.notices} onClose={() => {form.clear(); form.clearNotices();}}/>
  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!form.isValid}>Войти</Button>
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