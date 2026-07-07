<script>
  import {onMount} from 'svelte';
  import {authService} from '$lib/scripts/service/auth.service.js';
  import {POLL_STATUS} from '$lib/scripts/service/device.authorization.service.js';
  import QrCode from '$lib/components/QrCode.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import {LEVEL} from '$lib/scripts/util/notice.util.js';
  import {noticeService} from "$lib/scripts/service/notice.service.js";
  import Notice from "$lib/components/ui/Notice.svelte";

  /**
   * Запрашивающая сторона device-flow (RFC 8628, §5.1–5.2 гайда): получает `user_code`,
   * показывает его + QR на `verification_uri_complete` и поллит token-эндпоинт до выдачи
   * токенов. Подтверждение приходит со стороннего (уже авторизованного) устройства.
   *
   * Свой экземпляр DAF на компонент (`authService.createDeviceAuthorization()`); здесь —
   * UI и привязка lifecycle (старт в onMount, стоп при размонтировании). `onAuthorized`
   * передаётся в `startLogin` и зовётся ИМПЕРАТИВНО в момент прихода токенов — поэтому
   * срабатывает даже если компонент размонтируется фактом авторизации.
   *
   * @param {{scope?: string, authorizationDetails?: object, onAuthorized?: Function}} props
   *   Пустой `scope` ⇒ `AAD:USER` (вход устройства приложения). `onAuthorized` —
   *   что делать после выдачи токенов.
   */
  const {
    scope,
    authorizationDetails,
    onAuthorized = () => {},
  } = $props();

  // Конфиг флоу — снимок пропсов на создание (живёт сколько экземпляр); он статичен.
  // svelte-ignore state_referenced_locally
  const device = authService.createDeviceAuthorization({scope, authorizationDetails, onAuthorized});
  const statusNotices = $derived.by(() => {
    switch (device.pollStatus) {
      case POLL_STATUS.STARTING: return noticeService.create("Запрашиваем код...", LEVEL.WARNING);
      case POLL_STATUS.PENDING: return noticeService.create("Ожидаем подтверждения...", LEVEL.INFO);
      case POLL_STATUS.AUTHORIZED: return noticeService.create("Входим...", LEVEL.INFO);
      case POLL_STATUS.DENIED: return noticeService.create("Запрос отклонён.", LEVEL.ERROR);
      case POLL_STATUS.EXPIRED: return noticeService.create("Код истёк.", LEVEL.WARNING);
      case POLL_STATUS.ERROR: return noticeService.create("Не удалось получить код.", LEVEL.ERROR);
    }
  });
  const isNotSucceeded = $derived([POLL_STATUS.DENIED, POLL_STATUS.EXPIRED, POLL_STATUS.ERROR].indexOf(device.pollStatus) !== -1)

  onMount(() => {
    device.startLogin();
    return () => device.stopLogin();
  });

  const onRestart = () => device.restartLogin();
</script>

<div class="device-auth content-box">
  {#if device.verificationUriComplete}
    <div class="device-qr">
      <QrCode url={device.verificationUriComplete}/>
      <output class="device-code">{device.userCode}</output>
    </div>
  {/if}

  <Notice notice={statusNotices} closeable={false}/>
  {#if isNotSucceeded}
    <Button onclick={onRestart}>Повторить</Button>
  {/if}
</div>

<style>
  :global {
    .device-auth > * {
      margin-bottom: var(--ui-spacing);
    }
    /*.device-auth > *:last-child {*/
    /*  margin-bottom: 0;*/
    /*}*/
  }


  .device-qr {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ui-spacing);
  }

  .device-qr :global(canvas) {
    width: 256px;
    border: var(--ui-size-border) solid var(--color-ui-border);
    box-shadow: 4px 4px 0 0 var(--color-ui-shadow);
  }

  .device-code {
    /*inline-size: 100%;        !* ширина блока = ширине QR/контейнера *!*/
    box-sizing: border-box;
    text-align: center;
    white-space: nowrap;

    /* Размер шрифта масштабируется под ширину контейнера (= ширине QR).
       16cqi подобрано так, чтобы 8-символьный код заполнял ширину — крути число. */
    font-size: 20px;
    letter-spacing: 0.25em;
    font-family: "Minecraft", monospace;
    font-weight: bold;
    padding-block: calc(var(--ui-spacing) / 2);
    user-select: all;
  }

  .device-hint {
    /*color: var(--color-text-secondary);*/
  }

  .device-error {
    color: var(--color-red-main);
  }
</style>
