<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import {DEVICE_STATUS} from "$lib/scripts/store/device.store.svelte.js";
  import QrCode from "$lib/components/QrCode.svelte";
    import Notice from "./ui/Notice.svelte";
  import {noticeService} from "$lib/scripts/service/notice.service.js";

  /**
   * UI согласия device-flow (RFC 8628, §5.3–5.4 гайда): показывает, что именно
   * подтверждает пользователь (DeviceAuthorizationInfo), и даёт решение
   * «Разрешить/Запретить». Картинка субъекта (иконка сервера / голова скина игрока)
   * рисуется из base64 в `details`.
   */
  const {
    info,
    status,
    onAllow,
    onDeny,
  } = $props();

  // Человекочитаемый заголовок по типу субъекта (§5.3: USER сюда не попадает —
  // он подтверждается автоматически, но оставляем ветку для полноты).
  const TITLES = {
    MINECRAFT_PLAYER: 'Авторизация игрока',
    MINECRAFT_SERVER: 'Авторизация сервера',
    USER: 'Вход устройства приложения',
  };

  const details = $derived(info?.details ?? {});

  const title = $derived(TITLES[info?.type] ?? 'Подтверждение входа устройства');

  const imageBase64 = $derived(details.skinHeadBase64 ?? details.icon ?? null);
  const imageSrc = $derived(parseImageBase64(imageBase64));
  // Голова скина — пиксель-арт: рисуем без сглаживания.
  const isPixelated = $derived(!!details.skinHeadBase64);

  // Пары «поле → значение» для отображения (только непустые, без секретов).
  const rows = $derived([
    ['Хост', details.host],
    ['Игрок', details.username],
    ['UUID', details.uuid],
    ['Оператор', details.isOperator === undefined ? undefined : (details.isOperator ? 'да' : 'нет')],
    ['Источник', info?.source],
    ['Зоны', info?.targets?.length ? info.targets.join(', ') : undefined],
    ['Права', info?.permissions?.length ? info.permissions.join(', ') : undefined],
  ].filter(([, value]) => value !== undefined && value !== null && value !== ''));

  const isBusy = $derived(status === DEVICE_STATUS.APPROVING || status === DEVICE_STATUS.DENYING);
  const isDecided = $derived(status === DEVICE_STATUS.APPROVED || status === DEVICE_STATUS.DENIED);

  const STATUS_MESSAGES = {
    [DEVICE_STATUS.APPROVING]: {level: 'info', message: 'Подтверждаем…'},
    [DEVICE_STATUS.APPROVED]: {level: 'info', message: 'Доступ разрешён — вернитесь к устройству.'},
    [DEVICE_STATUS.DENYING]: {level: 'info', message: 'Отклоняем…'},
    [DEVICE_STATUS.DENIED]: {level: 'warning', message: 'Доступ запрещён.'},
    [DEVICE_STATUS.FAILED]: {level: 'error', message: 'Не удалось обработать запрос. Попробуйте снова.'},
  };
  const statusNotice = $derived((status) => {
    const notice = STATUS_MESSAGES[status];
    if (!notice) {
      return [];
    }

    return [{...notice}]
  });

  function parseImageBase64(imageBase64) {
    if (!imageBase64) {
      return null;
    }

    if (imageBase64.startsWith('data:')) {
      return imageBase64;
    }

    return `data:image/png;base64,${decodeURIComponent(imageBase64).replace(/ /g, '+')}`;
  }
</script>

<div class="device-consent content-box">
  <h1>{title}</h1>

  <div class="device-subject">
    {#if imageSrc}
      <img class="device-image"
           class:pixelated={isPixelated}
           src={imageSrc}
           alt="Изображение субъекта запроса"/>
    {/if}

    <dl class="device-details">
      {#each rows as [label, value] (label)}
        <div class="device-detail">
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      {/each}
    </dl>
  </div>

  <QrCode url={location.href}/>

  {#if statusNotice}
    <Notice notices={statusNotice()}/>
<!--    <p class="device-status {notice.level}">{notice.message}</p>-->
  {/if}

  {#if !isDecided}
    <div class="device-actions content-line">
      <Button onclick={onAllow} disabled={isBusy}>Разрешить</Button>
      <Button onclick={onDeny} disabled={isBusy} classes="deny">Запретить</Button>
    </div>
  {/if}
</div>

<style>
  .device-consent > * {
    margin-bottom: var(--ui-spacing);
  }

  .device-subject {
    display: flex;
    gap: var(--ui-spacing);
    align-items: flex-start;
  }

  .device-image {
    width: 64px;
    height: 64px;
    flex: 0 0 auto;
    object-fit: contain;
    border: var(--ui-size-border) solid var(--color-ui-border);
    background-color: var(--color-ui-secondary);
  }

  /* Голова скина Minecraft — пиксель-арт, без сглаживания при масштабировании. */
  .device-image.pixelated {
    image-rendering: pixelated;
  }

  .device-details {
    flex: 1 1 auto;
    min-width: 0;
    margin: 0;
  }

  .device-detail {
    display: flex;
    gap: var(--ui-spacing);
    justify-content: space-between;
  }

  .device-detail dt {
    /*color: var(--color-text-secondary);*/
    white-space: nowrap;
  }

  .device-detail dd {
    margin: 0;
    text-align: right;
    overflow-wrap: anywhere;
  }

  .device-actions {
    display: flex;
    gap: var(--ui-spacing);
  }

  .device-status {
    padding: 5px 10px;
  }

  .device-status.error {
    color: var(--color-red-main);
  }
</style>
