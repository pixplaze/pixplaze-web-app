<script>
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import Icon from '$ui/Icon.svelte';
  import {copyToClipboard} from '$util/dom.util.js';
  import {pointerHint} from '$scripts/pointerHint.svelte.js';
  import {ROUTES} from '$scripts/routes.js';
  import ServerIcon from '$components/servers/ServerIcon.svelte';
  import ServerState from '$components/servers/ServerStatus.svelte';

  /**
   * Плитка сервера в листинге: иконка, название, онлайн/пинг/версия и средняя оценка.
   * Клик по плитке открывает страницу сервера: ссылка — на названии, её область растянута на всю плитку,
   * а кнопки лежат поверх и кликаются отдельно (вложить кнопки в <a> нельзя).
   * favorite — сервер в избранном; null — избранное недоступно (гость), сердце скрыто.
   * onFavorite — клик по сердцу; что делать, решает владелец карточки.
   * friendsOnline — сколько взаимных друзей сейчас на сервере; больше нуля — зелёная плашка снизу.
   */
  let {
    server,
    favorite = null,
    friendsOnline = 0,
    onFavorite
  } = $props();

  const friendsLabel = $derived.by(() => {
    const n = friendsOnline, mod10 = n % 10, mod100 = n % 100;
    const word = mod10 === 1 && mod100 !== 11 ? 'друг'
        : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14) ? 'друга' : 'друзей';
    return `${n} ${word}`;
  });

  let copied = $state(false);

  const ratingLabel = $derived(server.rating == null ? '—'
      : server.rating.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}));
  const ratingTitle = $derived(server.ratingCount ? `Средняя оценка, голосов: ${server.ratingCount}` : 'Оценок пока нет');

  const onCopy = async (event) => {
    await copyToClipboard(server.host);
    pointerHint.show('IP скопирован', event);
    copied = true;
    setTimeout(() => copied = false, 1500);
  };
</script>

<article class="server-card">
  <div class="server-card-row">
    <ServerIcon src={server.image} alt=""/>
    <div class="server-info">
      <h2 class="server-name" class:linked={server.isLinked}>
        <a href={ROUTES.server(server.id)}
           title={server.isLinked ? `${server.name} — подключён к Pixplaze` : server.name}>{server.name}</a>
      </h2>
      <ServerState core={server.core} state={server.state} max={false} classes="server-stats"/>
      <span class="server-score" title={ratingTitle} class:empty={server.rating == null}>
        <Icon icon="star-filled"/>{ratingLabel}
      </span>
    </div>
    <div class="buttons">
      {#if server.host}
        <ButtonIcon icon={copied ? 'arrow-ok' : 'ip'}
                    title={`Скопировать адрес ${server.host}`}
                    classes="transparent {copied ? 'copied' : ''}" onclick={onCopy}/>
      {/if}
      {#if favorite !== null}
        <ButtonIcon icons={favorite ? ['heart-filled'] : ['heart', 'heart-filled']}
                    title={favorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                    classes="transparent favorite" onclick={() => onFavorite?.(server)}/>
      {/if}
    </div>
  </div>
  {#if friendsOnline > 0}
    <span class="friends-online" title="{friendsLabel} онлайн">
      <Icon icon="people"/>{friendsLabel}
    </span>
  {/if}
</article>

<style>
  /* font-synthesis: у пиксельного шрифта одно начертание, синтетический жирный размазывает пиксели */
  .server-card {
    --server-icon-size: 112px;
    position: relative;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    min-width: 256px;
    overflow: hidden;

    font-family: var(--font-ui);
    font-synthesis: none;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
    cursor: pointer;
    transition: transform .12s ease-out, box-shadow .12s ease-out, border-color .12s ease-out;
  }

  .server-card:hover {
    transform: translate(-2px, -2px);
    box-shadow: var(--ui-nb-shadow-hover);
  }

  /* Фокус ссылки с клавиатуры — рамка всей плитки */
  .server-card:has(.server-name a:focus-visible) {
    outline: var(--ui-size-border) solid var(--color-ui-focus);
    outline-offset: 2px;
  }

  .server-card-row {
    display: flex;
    flex: 1 0 auto;
    min-height: var(--server-icon-size);
  }

  /* Друзья на сервере: зелёный бейдж в правом нижнем углу, под кнопками. Клики пропускает к плитке */
  .friends-online {
    position: absolute;
    right: 6px;
    bottom: 6px;
    z-index: 1;
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px 0 2px;
    height: 24px;
    pointer-events: none;

    font-family: var(--font-ui);
    font-size: 18px;
    line-height: 1;
    color: var(--color-birch);
    background-color: var(--color-green-main);
    border-radius: var(--ui-radius);
    box-shadow: 2px 2px 0 0 var(--color-green-deep);
  }

  /* Иконка без рамки, растягивается на высоту плитки, если статистика ушла на вторую строку */
  .server-card :global(.server-icon) {
    align-self: stretch;
    height: auto;
    min-height: var(--server-icon-size);
    object-fit: cover;
    border-right: var(--ui-nb-border);
    image-rendering: pixelated;
  }

  .server-info {
    flex: 1 1 auto;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 4px 10px 12px;
  }

  /* Кегли кратны 6 px — сетка Ark Pixel (12 px): на экранах с DPR 2 пиксели шрифта ложатся ровно */
  .server-name {
    flex-shrink: 0;
    margin: 0;
    font-family: var(--font-ui);
    font-size: 24px;
    font-weight: 400;
    line-height: 1.1;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;

    /* font: inherit — глобальный стиль ссылок задаёт свой шрифт и кегль */
    a {
      font: inherit;
      color: inherit;
      text-decoration: none;
      outline: none;
    }

    /* Растянутая ссылка: кликабельна вся плитка */
    a::after {
      content: '';
      position: absolute;
      inset: 0;
      z-index: 0;
    }

    &.linked {
      color: var(--color-green-deep);
    }
  }

  .server-info :global(.server-stats) {
    font-size: 18px;
    color: var(--color-stone);
  }

  .server-score {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    width: max-content;
    margin-top: auto;
    font-family: var(--font-ui);
    font-size: 18px;

    :global(.icon) {
      color: var(--color-gold);
    }

    &.empty {
      color: var(--color-stone);

      :global(.icon) {
        color: var(--color-stone-light);
      }
    }
  }

  /* Кнопки поверх растянутой ссылки */
  .buttons {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding: 6px;
  }

  .buttons :global(button.button.ui.interactive.transparent) {
    width: 36px;
    height: 36px;
    min-width: 36px;
    min-height: 36px;
    color: var(--color-coal);
    border-radius: var(--ui-radius);
    transition: background-color .12s ease-out;

    &:hover {
      background-color: var(--color-sandstone);
    }

    &:active {
      background-color: var(--color-stone-light);
      border-color: transparent;
    }
  }

  .buttons :global(button.button.ui.interactive.transparent.copied) {
    color: var(--color-green-deep);
  }

  /* Сердце: контур, при наведении — заливка; в избранном — всегда залито цветом редстоуна */
  .buttons :global(button.button.ui.interactive.transparent.favorite) {
    color: var(--color-redstone);
  }

  .buttons :global(.favorite:hover use[href$="#heart"]) {
    opacity: 0;
  }

  .buttons :global(.favorite:hover use[href$="#heart-filled"]) {
    opacity: 1;
  }

  /* Телефон: иконка и название меньше, чтобы название не обрезалось до пары слов */
  @media screen and (max-width: 440px) {
    .server-card {
      --server-icon-size: 88px;
    }

    .server-name {
      font-size: 18px;
    }

    .buttons {
      gap: 2px;
    }

    .buttons :global(button.button.ui.interactive.transparent) {
      width: 32px;
      height: 32px;
      min-width: 32px;
      min-height: 32px;
    }

    /* Низкая плитка: бейдж друзей не влезает под две кнопки — даём место (6 + 32 + 2 + 32 + 2 + 24 + 6) */
    .server-card:has(.friends-online) .server-card-row {
      min-height: 104px;
    }
  }
</style>
