<script>
  import {onMount} from 'svelte';
  import {authService} from '$lib/scripts/service/auth.service.js';
  import {POLL_STATUS} from '$lib/scripts/store/device.store.svelte.js';
  import {ROUTES} from '$lib/scripts/routes.js';
  import {pageService} from "$lib/scripts/service/page.service.js";
  import QrCode from '$lib/components/QrCode.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';

  /**
   * Запрашивающая сторона device-flow (RFC 8628, §5.1–5.2 гайда): получает `user_code`,
   * показывает его + QR на `verification_uri_complete` и поллит token-эндпоинт до выдачи
   * токенов. Подтверждение приходит со стороннего (уже авторизованного) устройства.
   *
   * Логика и состояние — в фасаде authService.device; здесь — UI и привязка lifecycle
   * (старт в onMount, стоп при размонтировании).
   *
   * @param {{scope?: string, authorizationDetails?: object, onAuthorized?: Function}} props
   *   Пустой `scope` ⇒ `AAD:USER` (вход устройства приложения). `onAuthorized` —
   *   что делать после выдачи токенов (по умолчанию — переход на главную).
   */
  const {
    scope,
    authorizationDetails,
    onAuthorized = () => pageService.navigate(ROUTES.home),
  } = $props();

  const device = authService.device;

  onMount(() => {
    device.startLogin({scope, authorizationDetails});
    return () => device.stopLogin();
  });

  const onRestart = () => device.restartLogin({scope, authorizationDetails});

  // После выдачи токенов (refresh — уже в HttpOnly-куке) отдаём управление владельцу.
  $effect(() => {
    if (device.pollStatus === POLL_STATUS.AUTHORIZED) {
      onAuthorized();
    }
  });
</script>

<div class="device-auth content-box">
  <h1>Вход по QR</h1>

  {#if device.pollStatus === POLL_STATUS.STARTING}
    <p class="device-hint">Запрашиваем код…</p>
  {:else if device.pollStatus === POLL_STATUS.PENDING}
    <p class="device-hint">
      Отсканируйте QR-код на авторизованном устройстве или откройте
      <strong>{device.verificationUri}</strong> и подтвердите вход.
    </p>

    {#if device.verificationUriComplete}
      <div class="device-qr">
        <QrCode url={device.verificationUriComplete}/>
        <output class="device-code">{device.userCode}</output>
      </div>
    {/if}

    <p class="device-hint device-waiting">Ожидаем подтверждения…</p>
    {:else if device.pollStatus === POLL_STATUS.AUTHORIZED}
    <p class="device-hint">Готово — входим…</p>
    {:else if device.pollStatus === POLL_STATUS.DENIED}
    <p class="device-hint">Запрос отклонён.</p>
    <Button onclick={onRestart}>Начать заново</Button>
    {:else if device.pollStatus === POLL_STATUS.EXPIRED}
    <p class="device-hint">Код истёк.</p>
    <Button onclick={onRestart}>Получить новый код</Button>
    {:else if device.pollStatus === POLL_STATUS.ERROR}
    <p class="device-hint device-error">Не удалось получить код. Попробуйте снова.</p>
    <Button onclick={onRestart}>Повторить</Button>
  {/if}
</div>

<style>
  .device-auth > * {
    margin-bottom: var(--ui-spacing);
  }

  .device-qr {
    /* Контейнер-эталон ширины: его inline-size = ширине QR, от неё пляшут cqi-юниты. */
    container-type: inline-size;
    inline-size: 100%;
    max-inline-size: 100%;    /* на узких экранах ужимаемся к ширине родителя */
    margin-inline: auto;

    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--ui-spacing);
  }

  /* QR (canvas внутри QrCode) тянется на всю ширину контейнера. */
  .device-qr :global(canvas) {
    display: block;
    inline-size: 100%;
    block-size: auto;
  }

  .device-code {
    inline-size: 100%;        /* ширина блока = ширине QR/контейнера */
    box-sizing: border-box;
    text-align: center;
    white-space: nowrap;

    /* Размер шрифта масштабируется под ширину контейнера (= ширине QR).
       16cqi подобрано так, чтобы 8-символьный код заполнял ширину — крути число. */
    font-size: 40px;
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
