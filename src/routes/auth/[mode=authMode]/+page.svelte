<script>
  import {page} from '$app/state';
  import {pageService} from '$lib/scripts/service/page.service.js';
  import SignInForm from '$lib/components/SignInForm.svelte';
  import SignUpForm from '$lib/components/SignUpForm.svelte';
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import {authService} from "$lib/scripts/service/auth.service.js";

  // Активная форма: 'sign-in' | 'sign-up'. Инициализируется из адреса маршрута.
  let mode = $state(page.params.mode);

  // inviteCode нужен только регистрации; читаем один раз из query.
  const inviteCode = page.url.searchParams.get('inviteCode');

  /** Сделать форму активной и отразить это в адресе, сохранив query (inviteCode). */
  function activate(next) {
    if (mode === next) {
      return;
    }
    mode = next;
    pageService.setAuthMode(next, page.url.search);
  }

  const onSignIn = (data) => authService.signIn(data);
  const onSignUp = (data) => authService.signUp(data);
</script>

<div class="auth">
  <section class="auth-pane">
    <div class="ui box content-line">
      <Button onclick={() => activate('sign-in')} disabled={mode === 'sign-in'}>Вход</Button>
      <Button onclick={() => activate('sign-up')} disabled={mode === 'sign-up'}>Регистрация</Button>
    </div>
  </section>
  {#if mode === 'sign-in'}
    <section class="auth-pane"
             class:active={mode === 'sign-in'}
             onfocusin={() => activate('sign-in')}>
      <SignInForm onSubmit={onSignIn}/>
  <!--    <Delimiter value="или" classes="content-box"/>-->
    </section>
  {/if}
  {#if mode === 'sign-up'}
    <section class="auth-pane"
             class:active={mode === 'sign-up'}
             onfocusin={() => activate('sign-up')}>
      <SignUpForm {inviteCode} onSubmit={onSignUp}/>
    </section>
  {/if}
  <section class="auth-switch">

  </section>
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

  /*!* Неактивная форма слегка приглушена, но остаётся доступной. *!*/
  /*.auth-pane:not(.active) {*/
  /*  opacity: .5;*/
  /*}*/

  /* Колонка-переключатель форм: те же размеры, что у пейнов, но без приглушения. */
  .auth-switch {
    flex: 1 1 320px;
    max-width: 440px;
  }

  .ui.box {
    box-sizing: border-box;
    display: flex;
    /*gap: calc(var(--ui-padding) / 2);*/
    /*padding: calc(var(--ui-padding) / 2);*/
    /*border: var(--ui-size-border) solid var(--color-ui-border);*/
    margin-bottom: var(--ui-spacing);
  }

  :global {
    .delimiter.content-box {
      display: none;
    }

    @media (--mobile) {
      .delimiter.content-box {
        display: inline-flex;
      }
    }
  }
</style>