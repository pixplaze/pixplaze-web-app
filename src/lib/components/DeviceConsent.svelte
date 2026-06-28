<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import QrCode from "$lib/components/QrCode.svelte";
  import Notice from "./ui/Notice.svelte";

  /**
   * UI согласия device-flow (RFC 8628, §5.3–5.4 гайда): показывает, что именно
   * подтверждает пользователь (DeviceAuthorizationInfo), и даёт решение
   * «Разрешить/Запретить». Картинка субъекта (иконка сервера / голова скина игрока)
   * рисуется из base64 в `details`.
   *
   * Состояние передаётся простыми флагами от страницы-владельца:
   * `busy` — запрос в полёте, `done` — итог ('approved'|'denied'|null), `failed` — ошибка.
   */
  const {
    info,
    busy = false,
    done = null,
    failed = false,
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

  const isDecided = $derived(done !== null);

  // Уведомления статуса для Notice (массив; пустой — ничего не показываем).
  const notices = $derived.by(() => {
    if (failed) {
      return [{level: 'error', message: 'Не удалось обработать запрос. Попробуйте снова.'}];
    }
    if (busy) {
      return [{level: 'info', message: 'Отправляем решение…'}];
    }
    if (done === 'approved') {
      return [{level: 'info', message: 'Доступ разрешён — вернитесь к устройству.'}];
    }
    if (done === 'denied') {
      return [{level: 'warning', message: 'Доступ запрещён.'}];
    }
    return [];
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

  {#if notices.length}
    <Notice {notices} closeable={false}/>
  {/if}

  {#if !isDecided}
    <div class="device-actions content-line">
      <Button onclick={onAllow} disabled={busy}>Разрешить</Button>
      <Button onclick={onDeny} disabled={busy} classes="deny">Запретить</Button>
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
</style>
