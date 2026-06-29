<script>
  import {onMount} from 'svelte';
  import {page} from '$app/state';
  import {authService} from '$lib/scripts/service/auth.service.js';
  import DeviceConsent from '$lib/components/DeviceConsent.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';
  import {replaceState} from "$app/navigation";

  // user_code из device-flow (?userCode=...) — подтверждение входа стороннего устройства
  // (RFC 8628, §5.3–5.4). Профиль доступен только авторизованному (guard в корневом layout),
  // что и нужно DCF: одобряет вход носитель AAD.
  const userCode = page.url.searchParams.get('userCode');

  // Device-Consent-Flow — экземпляр на страницу.
  const consent = authService.createDeviceConsent();
  const showDeviceConsent = $derived(!!consent.info);

  onMount(() => consent.resolveConsent(userCode));

  const onAllow = async () => {
    await consent.decideConsent(true);
    replaceState(page.url.pathname, {});
  };
  const onDeny = async () => {
    await consent.decideConsent(false);
    replaceState(page.url.pathname, {});
  };

  // Баннер статуса подтверждения (когда панель согласия ещё/уже не показывается).
  const deviceNotices = $derived.by(() => {
    if (showDeviceConsent) {
      return [];
    }
    if (consent.failed) {
      return [{level: 'error', message: 'Не удалось подтвердить вход устройства. Попробуйте снова.'}];
    }
    if (consent.busy) {
      return [{level: 'info', message: 'Подтверждаем вход устройства…'}];
    }
    if (consent.done === 'approved') {
      return [{level: 'info', message: 'Вход устройства подтверждён — вернитесь к устройству.'}];
    }
    if (consent.done === 'denied') {
      return [{level: 'warning', message: 'Вход устройства отклонён.'}];
    }
    return [];
  });
</script>

<div class="profile">
  <section class="profile-pane">
    <h1>Профиль</h1>
  </section>

  {#if deviceNotices.length}
    <section class="profile-pane">
      <Notice notices={deviceNotices} closeable={false} classes="content-box"/>
    </section>
  {/if}

  {#if showDeviceConsent}
    <section class="profile-pane">
      <DeviceConsent info={consent.info}
                     busy={consent.busy}
                     done={consent.done}
                     failed={consent.failed}
                     {onAllow}
                     {onDeny}/>
    </section>
  {/if}
</div>

<style>
  .profile {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    align-items: flex-start;
    gap: var(--ui-spacing);
    padding-top: var(--ui-spacing);
  }

  .profile-pane {
    flex: 1 1 440px;
    box-sizing: border-box;
  }
</style>
