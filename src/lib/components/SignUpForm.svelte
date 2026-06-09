<script>
  import {api} from '$lib/scripts/api/api.config.js';
  import {getEmailSuggestions, getUsernameSuggestions} from '$lib/scripts/service/autocomplition.js';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import {check, checkAsync, email, minLength, pipe, pipeAsync, regex, string} from 'valibot';
  import InputAutocompletionWrapper from '$lib/components/ui/inputs/InputAutocompletionWrapper.svelte';
  import Delimiter from '$lib/components/ui/Delimiter.svelte';
  import InputValidationWrapper from '$lib/components/ui/inputs/InputValidationWrapper.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import noticeService from '$lib/scripts/service/notice.js';
  import {createFormData, isFormDataValid} from "$lib/scripts/service/form.service.js";

  const {
    inviteCode,
    onSubmit
  } = $props();

  let userName = $state("");
  let isUserNameValid = $state(false);
  let userEmail = $state("");
  let isEmailValid = $state(false);
  let userPassword = $state("");
  let isPasswordValid = $state(false);
  let userPasswordRepeat = $state("");
  let isPasswordRepeatValid = $state(false);
  let userInviteCode = $state((() => inviteCode || '')());
  let isInviteCodeValid = $state((() => !!inviteCode)())
  let isFormValid = $derived(isSignUpFormValid(isEmailValid, isPasswordValid, isPasswordRepeatValid, isInviteCodeValid));
  
  const formData = {
    username: {
      value,
      isValid:
    },
    email: {
      value,
      isValid: false
    },
    password: {
      value,
      isValid: false
    },
    passwordRepeat: {
      value,
      isValid: false
    },
    inviteCode: {
      value,
      isValid: false
    }
  }

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
      check(r => r === userPassword, 'Пароли должны совпадать')
  );
  const inviteCodeValidationSchema = pipeAsync(
      string(),
      minLength(8, 'Код приглашения должен состоять из 8 символов'),
      checkAsync(async voucher => {
        if (voucher.length < 8) {
          return true;
        }

        try {
          const result = await api.request(`/vouchers/invite/validate/${voucher}`, {method: 'POST'});
          return await result.json();
        } catch (e) {
          return false;
        }
      }, 'Неверный код приглашения'));

  function isSignUpFormValid(isEmailValid, isPasswordValid, isPasswordRepeatValid, isInviteCodeValid) {
    console.log(`isEmailValid: ${isEmailValid}, isPasswordValid: ${isPasswordValid}, isRepeatPasswordValid: ${isPasswordRepeatValid}, isInviteCodeValid: ${isInviteCodeValid}`)
    return userEmail && isEmailValid && userPassword && isPasswordValid && userPasswordRepeat && isPasswordRepeatValid && userInviteCode && isInviteCodeValid;
  }

  function onFormSubmit() {
    if (!isFormValid) {
      return;
    }

    const signUpData = $state.snapshot({
      username: userName,
      email: userEmail,
      password: userPassword,
      inviteCode: userInviteCode
    });

    onSubmit(signUpData);
  }
</script>

<form onsubmit={e => {e.preventDefault(); onSubmit()}} class="auth-form content-box">
  <h1 class="content-line">Регистрация</h1>

  <InputAutocompletionWrapper bind:value={userName} getSuggestions={getUsernameSuggestions}>
    {#snippet children({action})}
      <Input id="user-name"
             label="Имя пользователя"
             placeholder="notch"
             bind:value={userName}
             {action}
      />
    {/snippet}
  </InputAutocompletionWrapper>

  <InputValidationWrapper bind:value={userEmail}
                          bind:isValid={isEmailValid}
                          schema={emailValidationSchema}>
    {#snippet children({inputClasses})}
    <InputAutocompletionWrapper bind:value={userEmail}
                                getSuggestions={getEmailSuggestions}>
      {#snippet children({action})}
        <Input id="user-email"
               label="Электронная почта"
               placeholder="notch@email.com"
               classes={inputClasses}
               action={action}
               bind:value={userEmail}/>
      {/snippet}
    </InputAutocompletionWrapper>
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={passwordValidationSchema}
                          bind:value={userPassword}
                          bind:isValid={isPasswordValid}>
    {#snippet children({inputClasses})}
      <Input id="user-password"
             label="Пароль"
             type="password"
             placeholder="********"
             classes={` ${inputClasses}`}
             bind:value={userPassword}
      />
    {/snippet}
  </InputValidationWrapper>

  <InputValidationWrapper schema={repeatPasswordValidationSchema}
                          bind:value={userPasswordRepeat}
                          bind:isValid={isPasswordRepeatValid}>
    {#snippet children({inputClasses})}
      <Input id="user-password-repeat"
             label="Повторите пароль"
             type="password"
             placeholder="********"
             classes={` ${inputClasses}`}
             bind:value={userPasswordRepeat}/>
    {/snippet}
  </InputValidationWrapper>
  <InputValidationWrapper schema={inviteCodeValidationSchema}
                          onSuccess={async ic => {
                            const message = await api.request(`/vouchers/invite/message/${ic}`);
                            const notice = noticeService.create(await message.text(), noticeService.LEVEL.INFO);
                            console.log(notice);
                            inviteCodeNotices.push(notice);
                          }}
                          bind:value={userInviteCode}
                          bind:isValid={isInviteCodeValid}>
    {#snippet children({inputClasses})}
      <Input id="user-invite-code"
             label="Код приглашения"
             maxlength="8"
             disabled={inviteCode}
             classes={` ${inputClasses}`}
             bind:value={userInviteCode}/>
    {/snippet}
  </InputValidationWrapper>
  <Notice bind:notices={inviteCodeNotices}/>
  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!isFormValid}>Зарегистрироваться</Button>
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