<script>
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {pageService} from '$lib/scripts/service/page.service.js';
  import {authService} from "$lib/scripts/service/auth.service.js";
  import SignInForm from '$lib/components/SignInForm.svelte';
  import SignUpForm from '$lib/components/SignUpForm.svelte';
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Notice from "$lib/components/ui/Notice.svelte";
  import DeviceConsent from "$lib/components/DeviceConsent.svelte";
  import DeviceAuthorization from "$lib/components/DeviceAuthorization.svelte";
  import Delimiter from "$lib/components/ui/Delimiter.svelte";
  import QrCode from "$lib/components/QrCode.svelte";

  let mode = $state(page.params.mode);

  const inviteCode = page.url.searchParams.get('inviteCode');
  const userCode = page.url.searchParams.get('userCode');

  const device = authService.device;
  const showDeviceAuthorization = $derived(mode === 'device');
  const showDeviceConsent = $derived(!!device.info);
  const showSignIn = $derived(mode === 'sign-in');
  const showSignUp = $derived(mode === 'sign-up');
  const showRedirectQrCode = $derived(!authService.isAuthenticated && userCode)
  // const hideForms = $derived(authService.isAuthenticated && !!userCode);

  /** Сделать форму активной и отразить это в адресе, сохранив query (inviteCode/userCode). */
  function activate(next) {
    if (mode === next) {
      return;
    }
    mode = next;
    pageService.setAuthMode(next, page.url.search);
    console.log(mode, page.url.search);
  }

  onMount(() => device.resolveConsent(userCode));

  const onSignIn = async (data) => {
    const accessToken = await authService.signIn(data);
    if (accessToken) {
      await device.resolveConsent(userCode);
    }
    return accessToken;
  };

  const onSignUp = async (data) => {
    const accessToken = await authService.signUp(data);
    if (accessToken) {
      await device.resolveConsent(userCode);
    }
    return accessToken;
  };

  const onAllow = () => device.decideConsent(true);
  const onDeny = () => device.decideConsent(false);

  // Баннер авто-сценариев (USER) и ожидания входа. При показе панели — статус ведёт она.
  let deviceNotices = $derived.by(() => {
    if (showDeviceConsent) {
      return [];
    }
    if (device.consentFailed) {
      return [{level: 'error', message: 'Не удалось подтвердить вход устройства. Попробуйте снова.'}];
    }
    if (device.consentBusy) {
      return [{level: 'info', message: 'Подтверждаем вход устройства…'}];
    }
    if (device.consentDone === 'approved') {
      return [{level: 'info', message: 'Вход устройства подтверждён — вернитесь к устройству.'}];
    }
    if (!authService.isAuthenticated && userCode) {
      return [{level: 'info', message: 'Войдите или зарегистрируйтесь, чтобы подтвердить вход устройства.'}];
    }
    return [];
  });
  $inspect(`deviceNotice: ${JSON.stringify(deviceNotices)}`);
</script>

<div class="auth">
  {#if deviceNotices && deviceNotices.length !== 0}
    <section class="auth-pane device-flow">
      <Notice bind:notices={deviceNotices} closeable={true} autoCloseAfter={5000} classes="content-box"/>
    </section>
  {/if}
  {#if showSignIn}
    <section class="auth-pane form sign-in">
      <SignInForm onSubmit={onSignIn}/>
    </section>
  {/if}
  {#if showSignIn && showRedirectQrCode}
    <section class="auth-pane redirect">
      <Delimiter value="или сканируйте с авторизованного устройства" classes="content-line"/>
      <QrCode url={location.href}/>
    </section>
  {/if}
  {#if showSignUp}
    <section class="auth-pane form sign-up">
      <SignUpForm {inviteCode} onSubmit={onSignUp}/>
    </section>
  {/if}
  {#if showDeviceAuthorization}
    <section class="auth-pane">
      <DeviceAuthorization/>
    </section>
  {/if}
  {#if showDeviceConsent}
    <section class="auth-pane device-flow">
      <DeviceConsent info={device.info}
                     busy={device.consentBusy}
                     done={device.consentDone}
                     failed={device.consentFailed}
                     {onAllow}
                     {onDeny}/>
    </section>
  {/if}
</div>
<section class="auth-pane">
  <Delimiter value="или" classes="content-line"/>
  <div class="ui box">
    <Button onclick={() => activate('sign-in')} disabled={showSignIn}>Вход</Button>
    <Button onclick={() => activate('sign-up')} disabled={showSignUp}>Регистрация</Button>
    <Button onclick={() => activate('device')} disabled={showDeviceAuthorization}>Войти по QR</Button>
  </div>
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

  .auth-pane.device-flow {
    flex-basis: 100%;
    max-width: 440px;
  }

  .redirect {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .ui.box {
    box-sizing: border-box;
    display: flex;
    margin-bottom: var(--ui-spacing);
  }
</style>