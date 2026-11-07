<script>
  import {page} from '$app/state';
  import {navigation} from '$scripts/navigation.js';
  import {auth} from '$scripts/auth.svelte.js';
  import {ui} from '$scripts/ui.svelte.js';
  import {ROUTES} from '$scripts/routes.js';
  import SignInForm from '$components/auth/SignInForm.svelte';
  import SignUpForm from '$components/auth/SignUpForm.svelte';
  import Button from '$ui/buttons/Button.svelte';
  import DeviceAuthorization from '$components/auth/DeviceAuthorization.svelte';
  import Delimiter from '$ui/Delimiter.svelte';
  import ButtonSwitcher from "$ui/buttons/ButtonSwitcher.svelte";
  import {onMount} from 'svelte';

  let mode = $state(page.params.mode);

  const inviteCode = page.url.searchParams.get('inviteCode');
  const userCode = page.url.searchParams.get('userCode');

  const showSignIn = $derived(mode === 'sign-in');
  const showSignUp = $derived(mode === 'sign-up');

  onMount(() => {
    if (auth.isAuthenticated && userCode) {
      navigation.goTo(`${ROUTES.profile}${page.url.search}`);
    }
  })

  /** Сделать форму активной и отразить это в адресе, сохранив query (inviteCode). */
  function activate(next) {
    mode = next;
    navigation.setAuthMode(next, page.url.search);
    ui.scrollTop();
  }

  // После успешного входа (паролем или device-flow QR): если это был линк подтверждения
  // (?userCode=...) — уводим в /profile, сохраняя query, чтобы там подтвердить устройство;
  // иначе — на главную. Подтверждение (DCF) живёт на /profile, не здесь.
  const onAuthorized = () => {
    navigation.goTo(userCode ? `${ROUTES.profile}${page.url.search}` : ROUTES.home);
  };

  const onSignIn = async (data) => {
    const accessToken = await auth.signIn(data);
    if (!accessToken) throw new Error('Неверные учётные данные');
    onAuthorized();
  };

  const onSignUp = async (data) => {
    const accessToken = await auth.signUp(data);
    if (!accessToken) throw new Error('Не удалось создать аккаунт');
    onAuthorized();
  };
</script>

<div class="auth">
  {#if showSignIn}
    <section class="auth-pane form sign-in">
      <SignInForm onSubmit={onSignIn}/>
    </section>
  {/if}
  {#if showSignIn}
    <section class="auth-pane redirect">
      <Delimiter value="или" classes="content-line"/>
      <DeviceAuthorization {onAuthorized}/>
    </section>
  {/if}
  {#if showSignUp}
    <section class="auth-pane form sign-up">
      <SignUpForm {inviteCode} onSubmit={onSignUp}/>
    </section>
  {/if}
</div>
<section class="auth-pane">
  <Delimiter value="или" classes="content-line"/>
  <ButtonSwitcher bind:mode onSwitch={activate}>
    <Button title="Переключить режим на вход"
            data-id="sign-in">Вход</Button>
    <Button title="Переключить режим на регистрацию"
            data-id="sign-up">Регистрация</Button>
  </ButtonSwitcher>
</section>

<style>
  .auth {
    display: flex;
    flex-wrap: wrap;
    wrap-flow: both;
    justify-content: center;
    align-items: flex-start;
    padding-top: var(--ui-spacing);
    /*padding-bottom: calc(2 * var(--ui-spacing));*/
  }

  .auth-pane {
    flex: 1 1 440px;
    box-sizing: border-box;
    margin-bottom: var(--ui-spacing);
  }

  .auth-pane:last-child {
    margin-bottom: 0;
  }

  .auth-pane.form {
    margin-bottom: var(--ui-spacing);
  }

  .redirect {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  :global {
    @media screen and (min-width: 880px) {
      .auth-pane.redirect > .delimiter {
        display: none;
      }
    }
  }
</style>
