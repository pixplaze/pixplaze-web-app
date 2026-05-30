<script>
  import {api} from "$lib/scripts/api/api.config.js"
  import Input from "$lib/components/ui/inputs/Input.svelte";
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import {check, checkAsync, email, minLength, pipe, pipeAsync, regex, string} from 'valibot';
  import ValidatingInput from "$lib/components/ui/inputs/ValidationInput.svelte";
  import Autocomplete from "$lib/components/Autocomplete.svelte";

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
  let isRepeatPasswordValid = $state(false);
  let userInviteCode = $state(inviteCode);
  let isInviteCodeValid = $state(!!inviteCode)
  let isFormValid = $derived(isSignUpFormValid());

  const items = [
    'penis',
    'penal',
    'pencil',
    'ponos',
    'pashka',
    'pipidastr',
    'pinus',
    'opezdol',
    'bebra',
    'boloto',
    'borisoblebsk',
    'goyda',
    'govno'
  ];

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
        const result = await api.request(`/vouchers/validate/invite/${voucher}`, {method: 'POST'});
        return await result.json();
      }, 'Неверный код приглашения'));

  function isSignUpFormValid() {
    return isEmailValid && isPasswordValid && isRepeatPasswordValid && isInviteCodeValid;
  }

  function onFormSubmit() {
    if (!isFormValid) {
      return;
    }
    console.log('Submitting form...');
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

  <Autocomplete bind:value={userName} getItems={(v) => items}>
    {#snippet children({onFocus, onBlur, action})}
      <Input id="user-name"
             label="Имя пользователя"
             placeholder="notch"
             bind:value={userName}
             {action}
             {onFocus}
             {onBlur}
      />
    {/snippet}
  </Autocomplete>
  <ValidatingInput id="user-email"
                   label="Электронная почта"
                   placeholder="example@email.com"
                   schema={emailValidationSchema}
                   bind:value={userEmail}
                   bind:isValid={isEmailValid}/>
  <ValidatingInput id="user-password"
                   label="Пароль"
                   type="password"
                   placeholder="********"
                   schema={passwordValidationSchema}
                   bind:value={userPassword}
                   bind:isValid={isPasswordValid}/>
  <ValidatingInput id="user-password-repeat"
                   label="Повторите пароль"
                   type="password"
                   placeholder="********"
                   schema={repeatPasswordValidationSchema}
                   bind:value={userPasswordRepeat}
                   bind:isValid={isRepeatPasswordValid}/>
  <ValidatingInput id="user-invite-code"
                   label="Код приглашения"
                   maxlength="8"
                   disabled={inviteCode}
                   schema={inviteCodeValidationSchema}
                   bind:value={userInviteCode}
                   bind:isValid={isInviteCodeValid}/>
  <Button onclick={onFormSubmit}
          classes="content-line"
          disabled={!isFormValid}>Зарегистрироваться</Button>
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