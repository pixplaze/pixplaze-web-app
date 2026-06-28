<script>
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {pageService} from '$lib/scripts/service/page.service.js';
  import {authService} from "$lib/scripts/service/auth.service.js";
  import {deviceService} from "$lib/scripts/service/device.service.js";
  import {DEVICE_STATUS} from "$lib/scripts/store/device.store.svelte.js";
  import SignInForm from '$lib/components/SignInForm.svelte';
  import SignUpForm from '$lib/components/SignUpForm.svelte';
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Notice from "$lib/components/ui/Notice.svelte";
  import DeviceConsent from "$lib/components/DeviceConsent.svelte";
  import Delimiter from "$lib/components/ui/Delimiter.svelte";

  // Активная форма: 'sign-in' | 'sign-up'. Инициализируется из адреса маршрута.
  let mode = $state(page.params.mode);

  // inviteCode нужен только регистрации; читаем один раз из query.
  const inviteCode = page.url.searchParams.get('inviteCode');

  // user_code из device-flow (?userCode=...). Если есть — это подтверждение входа
  // стороннего устройства (RFC 8628, §5.4 гайда), а не обычный вход.
  const userCode = page.url.searchParams.get('userCode');

  /** Сделать форму активной и отразить это в адресе, сохранив query (inviteCode/userCode). */
  function activate(next) {
    if (mode === next) {
      return;
    }
    mode = next;
    pageService.setAuthMode(next, page.url.search);
  }

  // На входе на страницу: авторизован — аппрувим device-flow сразу; иначе код
  // запоминается, и аппрув произойдёт после входа/регистрации (resumePending).
  onMount(() => {
    deviceService.handleUserCode(userCode);
  });

  const onSignIn = async (data) => {
    const accessToken = await authService.signIn(data);
    if (accessToken) {
      await deviceService.resumePending();
    }
    return accessToken;
  };

  const onSignUp = async (data) => {
    const accessToken = await authService.signUp(data);
    if (accessToken) {
      await deviceService.resumePending();
    }
    return accessToken;
  };

  const onAllow = () => deviceService.allow();
  const onDeny = () => deviceService.deny();

  // Нужна ли интерактивная панель согласия (субъект != USER). USER подтверждается
  // автоматически и панель не показывает — для него работает только баннер.
  const showConsent = $derived(deviceService.requiresConsent);

  const deviceNotice = $derived.by(() => {
    if (showConsent) {
      return null;
    }
    switch (deviceService.status) {
      case DEVICE_STATUS.LOADING:
        return {level: 'info', message: 'Загружаем запрос на подтверждение…'};
      case DEVICE_STATUS.APPROVING:
        return {level: 'info', message: 'Подтверждаем вход устройства…'};
      case DEVICE_STATUS.APPROVED:
        return {level: 'info', message: 'Вход устройства подтверждён — вернитесь к устройству.'};
      case DEVICE_STATUS.FAILED:
        return {level: 'error', message: 'Не удалось подтвердить вход устройства. Попробуйте снова.'};
      default:
        return (!authService.isAuthenticated && (userCode || deviceService.hasPending))
          ? {level: 'info', message: 'Войдите или зарегистрируйтесь, чтобы подтвердить вход устройства.'}
          : null;
    }
  });
</script>

<div class="auth">
  {#if deviceNotice}
    <section class="auth-pane device-flow">
      <Notice notice={deviceNotice} closeable={true} autoCloseAfter={10000} classes="content-box"/>
    </section>
  {/if}
  {#if showConsent}
    <section class="auth-pane device-flow">
      <DeviceConsent url={page.params}
                     info={deviceService.info}
                     status={deviceService.status}
                     {onAllow}
                     {onDeny}/>
    </section>
  {/if}
  <!--{#if !hideForms}-->
    {#if mode === 'sign-in'}
      <section class="auth-pane content-line"
               class:active={mode === 'sign-in'}
               onfocusin={() => activate('sign-in')}>
        <SignInForm onSubmit={onSignIn}/>
<!--      <Delimiter value="или" classes="content-box"/>-->
      </section>
    {/if}
    {#if mode === 'sign-up'}
      <section class="auth-pane content-line"
               class:active={mode === 'sign-up'}
               onfocusin={() => activate('sign-up')}>
        <SignUpForm {inviteCode} onSubmit={onSignUp}/>
      </section>
    {/if}
    <section class="auth-pane">
      <Delimiter value="или" classes="content-line"/>
      <div class="ui box">
        <Button onclick={() => activate('sign-in')} disabled={mode === 'sign-in'}>Вход</Button>
        <Button onclick={() => activate('sign-up')} disabled={mode === 'sign-up'}>Регистрация</Button>
      </div>
    </section>
  <!--{/if}-->
</div>

<style>
  .auth {
    display: flex;
    flex-wrap: wrap;
    wrap-flow: both;
    justify-content: center;
    align-items: flex-start;
    padding-top: var(--ui-spacing);
    padding-bottom: calc(2 * var(--ui-spacing));
  }

  .auth-pane {
    flex: 1 1 320px;
    max-width: 440px;
    transition: opacity .2s ease;
  }

  /* Баннер device-flow — на всю ширину строки, над переключателем форм. */
  .auth-pane.device-flow {
    flex-basis: 100%;
    max-width: 440px;
  }

  .ui.box {
    box-sizing: border-box;
    display: flex;
    margin-bottom: var(--ui-spacing);
  }

  :global {
    /*.delimiter.content-box {*/
    /*  display: none;*/
    /*}*/

    /*@media (--mobile) {*/
    /*  .delimiter.content-box {*/
    /*    display: inline-flex;*/
    /*  }*/
    /*}*/
  }
</style>