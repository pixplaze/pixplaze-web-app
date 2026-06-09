<script>
  import {api} from '$lib/scripts/api/api.config.js';
  import noticeService from '$lib/scripts/service/notice.js';
  import {getEmailSuggestions, getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import {check, checkAsync, email, minLength, pipe, pipeAsync, regex, string} from 'valibot';
  import {createFormData, isFormDataValid} from "$lib/scripts/service/form.service.js";
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import Delimiter from '$lib/components/ui/Delimiter.svelte';
  import InputValidationWrapper from '$lib/components/ui/inputs/InputValidationWrapper.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import {voucherService} from "$lib/scripts/service/voucher.service.js";

  const {
    inviteCode,
    onSubmit
  } = $props();

  const data = $state(createFormData({
    name: {value: '', isValid: true},
    email: '',
    password: '',
    passwordRepeat: '',
    inviteCode: {value: inviteCode, isValid: !!inviteCode}
  }));

  const isDataValid = $derived(isFormDataValid(data));

  let inviteCodeNotices = $state([]);

  const emailValidationSchema = pipe(
      string(),
      email('Электронная почта не соответствует маске')
  );
  const passwordValidationSchema = pipe(
      string(),
      minLength(8, 'Пароль должен быть длиннее 8 символов'),
      regex(/[a-z]/, 'Пароль должен содержать хотя бы один символ в нижнем регистре'),
      regex(/[A-Z]/, 'Пароль должен содержать хотя бы один символ в верхнем регистре'),
      regex(/[0-9]/, 'Пароль должен содержать хотя бы один символ цифры'),
      regex(/[^a-zA-Z0-9]/, 'Пароль должен содержать хотя бы один спецсимвол')
  );
  const repeatPasswordValidationSchema = pipe(
      string(),
      check(r => r === data.password.value, 'Пароли должны совпадать')
  );
  const inviteCodeValidationSchema = pipeAsync(
      string(),
      minLength(8, 'Код приглашения должен состоять из 8 символов'),
      checkAsync(voucherService.isInviteCodeValid, 'Неверный код приглашения'));

  function onFormSubmit() {
    if (!isFormDataValid(data)) {
      return;
    }

    const signUpData = $state.snapshot({
      username: data.name.value,
      email: data.email.value,
      password: data.password.value,
      inviteCode: data.inviteCode.value
    });

    onSubmit(signUpData);
  }
</script>

<form onsubmit={e => {e.preventDefault(); onSubmit()}} class="auth-form content-box">
  <h1 class="content-line">Регистрация</h1>

  <InputAutocompletionWrapper bind:value={data.name.value} getSuggestions={getUsernameSuggestions}>
    {#snippet children({action})}
      <Input id="user-name"
             label="Имя пользователя"
             placeholder="notch"
             bind:value={data.name.value}
             {action}
      />
    {/snippet}
  </InputAutocompletionWrapper>

  <InputValidationWrapper bind:value={data.email.value}
                          bind:isValid={data.email.isValid}
                          schema={emailValidationSchema}>
    {#snippet children({inputClasses})}
    <InputAutocompletionWrapper bind:value={data.email.value}
                                getSuggestions={getEmailSuggestions}>
      {#snippet children({action})}
        <Input id="user-email"
               label="Электронная почта"
               placeholder="notch@email.com"
               classes={inputClasses}
               action={action}
               bind:value={data.email.value}/>
      {/snippet}
    </InputAutocompletionWrapper>
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={passwordValidationSchema}
                          bind:value={data.password.value}
                          bind:isValid={data.password.isValid}>
    {#snippet children({inputClasses})}
      <Input id="user-password"
             label="Пароль"
             type="password"
             placeholder="********"
             classes={` ${inputClasses}`}
             bind:value={data.password.value}
      />
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={repeatPasswordValidationSchema}
                          bind:value={data.passwordRepeat.value}
                          bind:isValid={data.passwordRepeat.isValid}>
    {#snippet children({inputClasses})}
      <Input id="user-password-repeat"
             label="Повторите пароль"
             type="password"
             placeholder="********"
             classes={` ${inputClasses}`}
             bind:value={data.passwordRepeat.value}/>
    {/snippet}
  </InputValidationWrapper>
  <InputValidationWrapper schema={inviteCodeValidationSchema}
                          onSuccess={async ic => {
                            const message = await api.request(`/vouchers/invite/message/${ic}`);
                            const notice = noticeService.create(await message.text(), noticeService.LEVEL.INFO);
                            console.log(notice);
                            inviteCodeNotices.push(notice);
                          }}
                          bind:value={data.inviteCode.value}
                          bind:isValid={data.inviteCode.isValid}>
    {#snippet children({inputClasses})}
      <Input id="user-invite-code"
             label="Код приглашения"
             maxlength="8"
             disabled={data.inviteCode.value}
             classes={` ${inputClasses}`}
             bind:value={data.inviteCode.value}/>
    {/snippet}
  </InputValidationWrapper>
  <Notice bind:notices={inviteCodeNotices}/>
  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!isDataValid}>Зарегистрироваться</Button>
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