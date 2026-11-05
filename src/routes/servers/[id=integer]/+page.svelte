<script>
  import {goto} from '$app/navigation';
  import ServerIcon from '$components/servers/ServerIcon.svelte';
  import ServerOnlineChart from '$components/servers/ServerOnlineChart.svelte';
  import Rating from '$ui/indicators/Rating.svelte';
  import Icon from '$ui/Icon.svelte';
  import {copyToClipboard} from '$util/dom.util.js';
  import {createDistinctDebounce} from '$util/debounce.util.js';
  import {serversApi} from '$api/servers.api.js';
  import {notifications} from '$scripts/notifications.svelte.js';
  import {pointerHint} from '$scripts/pointerHint.svelte.js';
  import {auth} from '$scripts/auth.svelte.js';
  import {favorites} from '$scripts/favorites.svelte.js';
  import {friends} from '$scripts/friends.svelte.js';
  import {currentUser} from '$scripts/user.svelte.js';
  import {permissions} from '$scripts/permissions.svelte.js';
  import {activeServer} from '$scripts/activeServer.svelte.js';
  import {ROUTES} from '$scripts/routes.js';
  import {serverTags, filterHref} from '$util/server.filters.js';

  /**
   * Страница сервера в стиле bento: каждая плитка — отдельный факт. Плитка показывается, только если для
   * неё есть данные, поэтому у сервера, собранного из открытых источников (без плагина), страница
   * просто компактнее, без пустых блоков. Сетка с dense-упаковкой сама закрывает пропуски.
   */
  let {data} = $props();
  const server = $derived(data.server);
  const history = $derived(data.history);

  const isOnline = $derived(server.state?.status === 'ONLINE');
  const players = $derived(isOnline ? server.state?.players : null);
  const ping = $derived(isOnline ? server.state?.ping : null);

  // Описание; нет — MOTD без кодов форматирования: у сервера без плагина это часто единственный текст о нём
  const aboutText = $derived(server.description
      || server.motd?.replace(/§[0-9a-fk-or]/gi, '').replace(/\s*\n\s*/g, ' — ').trim()
      || null);
  const tags = $derived(serverTags(server));

  // Длинное описание свёрнуто до нескольких строк; кнопка — только если текст не поместился
  let expanded = $state(false);
  let overflowing = $state(false);
  let aboutElement = $state();
  $effect(() => {
    aboutText;
    if (!aboutElement || expanded) return;
    overflowing = aboutElement.scrollHeight > aboutElement.clientHeight + 1;
  });

  const pingQuality = $derived(ping == null ? null
      : ping < 50 ? 'отличный' : ping < 100 ? 'хороший' : ping < 200 ? 'средний' : 'высокий');

  const ratingLabel = $derived(server.rating == null ? null
      : server.rating.toLocaleString(undefined, {minimumFractionDigits: 1, maximumFractionDigits: 1}));

  const plural = (n, one, few, many) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return one;
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
    return many;
  };

  // Друзья на сервере: свой онлайн и онлайн взаимных друзей грузит общий стор
  $effect(() => {
    const profileId = currentUser.value?.id;
    if (profileId) friends.loadOnline(profileId).catch(() => {});
  });
  const friendsHere = $derived(friends.online
      .map(friend => ({
        name: friend.name,
        players: friend.players.filter(player => player.server?.id === server.id).map(player => player.username)
      }))
      .filter(friend => friend.players.length > 0));

  // Панель управления — тем, у кого на сервере есть право читать консоль
  const canManage = $derived(server.isLinked && !!permissions.catalog.MC_CONSOLE_READ
      && permissions.canOn(server.id, permissions.catalog.MC_CONSOLE_READ));
  const actions = $derived([
    server.hasChat && {id: 'chat', icon: 'chat', label: 'Чат', route: ROUTES.serversChat},
    server.hasMap && {id: 'map', icon: 'map', label: 'Карта', route: ROUTES.serversMap},
    canManage && {id: 'panel', icon: 'console', label: 'Панель управления', route: ROUTES.serversConsole}
  ].filter(Boolean));
  const isFavorite = $derived(favorites.has(server.id));

  /** Чат, карта и консоль работают с активным сервером из избранного — делаем этот сервер активным. */
  const openOnServer = async (route) => {
    if (!favorites.has(server.id)) {
      await favorites.add(server);
      if (!favorites.has(server.id)) return;
    }
    activeServer.select(server);
    goto(route);
  };

  /** Вайп: скоро (в пределах недели) — сколько осталось, иначе — сколько прошло. */
  const wipe = $derived.by(() => {
    const now = Date.now(), day = 86_400_000;
    const next = server.wipe?.nextAt, last = server.wipe?.lastAt;
    if (next && next.getTime() > now && next.getTime() - now <= 7 * day) {
      const days = Math.ceil((next.getTime() - now) / day);
      return {title: 'До вайпа', value: `${days} ${plural(days, 'день', 'дня', 'дней')}`, date: next, soon: true};
    }
    if (last && last.getTime() <= now) {
      const days = Math.floor((now - last.getTime()) / day);
      return {title: 'С вайпа', value: `${days} ${plural(days, 'день', 'дня', 'дней')}`, date: last, soon: false};
    }
    return null;
  });

  const rateServer = createDistinctDebounce((rating) => serversApi.rate(server.id, rating), 1000);
  const onVoted = (rating) => {
    rateServer.run(rating).catch((e) => {
      if (e.name !== 'AbortError') {
        notifications.error('Вы не можете голосовать за этот сервер!');
      }
    });
  };

  const onCopy = async (event) => {
    await copyToClipboard(server.host);
    pointerHint.show('IP скопирован', event);
  };
</script>

<svelte:head>
  <title>{server.name} — Pixplaze</title>
</svelte:head>

<section class="server-page">
  <a class="back" href={ROUTES.serversList}>← Все серверы</a>

  <div class="bento">
    <!-- 1. Главное: кто это и как зайти -->
    <article class="tile hero full">
      <ServerIcon src={server.image} alt=""/>
      <div class="hero-info">
        <h1 class:linked={server.isLinked}
            title={server.isLinked ? 'Сервер подключён к Pixplaze' : undefined}>{server.name}</h1>
        {#if server.host}
          <button type="button" class="ip" title="Скопировать адрес" onclick={onCopy}>
            <Icon icon="ip"/><span>{server.host}</span>
          </button>
        {/if}
      </div>
    </article>

    <!-- 2. Стоит ли заходить: онлайн, пинг, версия, рейтинг -->
    <article class="tile stats full">
      {#if players}
        <div class="stat-cell">
          <span class="stat-label"><Icon icon="people"/>Онлайн</span>
          <span class="stat-value">{players.online}</span>
          <span class="stat-note">из {players.max}</span>
        </div>
      {:else if !isOnline}
        <div class="stat-cell muted">
          <span class="stat-label"><Icon icon="people"/>Онлайн</span>
          <span class="stat-value">—</span>
          <span class="stat-note">сервер офлайн</span>
        </div>
      {/if}
      {#if ping != null}
        <div class="stat-cell">
          <span class="stat-label"><Icon icon="ping"/>Пинг</span>
          <span class="stat-value">{ping}<small>мс</small></span>
          <span class="stat-note">{pingQuality}</span>
        </div>
      {/if}
      {#if server.core?.version}
        <div class="stat-cell">
          <span class="stat-label"><Icon icon="version"/>Версия</span>
          <span class="stat-value version">{server.core.version}</span>
          {#if server.core.name}<span class="stat-note">{server.core.name}</span>{/if}
        </div>
      {/if}
      <div class="stat-cell rating-cell">
        <span class="stat-label"><Icon icon="star-filled"/>Рейтинг</span>
        <span class="stat-value">{ratingLabel ?? '—'}</span>
        <span class="stat-note">{server.ratingCount
            ? `${server.ratingCount} ${plural(server.ratingCount, 'голос', 'голоса', 'голосов')}`
            : 'оценок пока нет'}</span>
        {#if auth.isAuthenticated}
          <div class="vote" title="Ваша оценка">
            <Rating icon="star" {onVoted}/>
          </div>
        {/if}
      </div>
    </article>

    <!-- 3. О сервере: описание (или MOTD, если описания нет) и теги — те же, что фильтры поиска -->
    {#if aboutText || tags.length}
      <article class="tile about full">
        {#if aboutText}
          <span class="stat-label">{server.description ? 'Описание' : 'Из списка серверов Minecraft'}</span>
          <p class="about-text" class:clamped={!expanded} bind:this={aboutElement}>{aboutText}</p>
          {#if overflowing || expanded}
            <button type="button" class="more" onclick={() => expanded = !expanded}>
              {expanded ? 'Свернуть' : 'Показать полностью'}
            </button>
          {/if}
        {/if}
        {#if tags.length}
          <ul class="tags" aria-label="Теги сервера">
            {#each tags as tag (tag.id)}
              <li><a class="tag" href={filterHref(tag.id)} title="Найти похожие серверы: {tag.title}">{tag.label}</a></li>
            {/each}
          </ul>
        {/if}
      </article>
    {/if}

    {#if friendsHere.length > 0}
      <article class="tile friends wide">
        <span class="stat-label"><Icon icon="people"/>Сейчас играют друзья</span>
        <ul>
          {#each friendsHere as friend (friend.name)}
            <li><b>{friend.name}</b><span>как {friend.players.join(', ')}</span></li>
          {/each}
        </ul>
      </article>
    {/if}

    {#if wipe}
      <article class="tile stat" class:soon={wipe.soon}>
        <span class="stat-label">{wipe.title}</span>
        <span class="stat-value">{wipe.value}</span>
        <span class="stat-note">{wipe.date.toLocaleDateString(undefined, {day: 'numeric', month: 'long'})}</span>
      </article>
    {/if}

    {#if actions.length > 0}
      <article class="tile actions wide">
        {#each actions as action (action.id)}
          <button type="button" class="action" onclick={() => openOnServer(action.route)}>
            <Icon icon={action.icon}/>{action.label}
          </button>
        {/each}
        {#if !isFavorite && auth.isAuthenticated}
          <span class="stat-note">Сервер добавится в избранное</span>
        {/if}
      </article>
    {/if}

    {#if history?.length}
      <article class="tile chart full">
        <span class="stat-label">Онлайн за неделю</span>
        <ServerOnlineChart points={history}/>
      </article>
    {/if}

    {#if !server.isLinked}
      <article class="tile notice full">
        <span class="stat-label">Данные из открытых источников</span>
        <p>Сервер не подключён к Pixplaze: мы знаем только то, что он сообщает о себе в списке серверов Minecraft.
          Чат, карта и друзья появятся, когда владелец подключит сервер.</p>
        <a href={ROUTES.serversBids}>Это ваш сервер? Подайте заявку →</a>
      </article>
    {/if}
  </div>
</section>

<style>
  .server-page {
    --server-icon-size: 112px;
    padding-top: var(--ui-spacing);
    padding-bottom: var(--ui-spacing);
    font-family: var(--font-ui);
    font-synthesis: none;
    font-size: 18px;
    color: var(--color-coal);
  }

  /* Глобальный стиль span задаёт свой шрифт — на странице все подписи пиксельные */
  span {
    font-family: var(--font-ui);
  }

  .back {
    display: inline-block;
    margin-bottom: var(--ui-spacing);
    font: inherit;
    color: var(--color-stone);
    text-decoration: none;

    &:hover {
      color: var(--color-coal);
    }
  }

  /* Bento: 4 колонки, плитки разной площади; dense закрывает дыры от отсутствующих плиток */
  .bento {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    grid-auto-flow: row dense;
    gap: 16px;
  }

  .tile {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 16px;
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
  }

  .wide {
    grid-column: span 2;
  }

  .full {
    grid-column: 1 / -1;
  }

  .stat-label {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--color-stone);
  }

  .stat-value {
    font-family: var(--font-ui);
    font-size: 36px;
    line-height: 1;

    small {
      margin-left: 4px;
      font-family: var(--font-ui);
      font-size: 18px;
      color: var(--color-stone);
    }

    &.version {
      font-size: 24px;
      overflow-wrap: anywhere;
    }
  }

  .stat-note {
    font-size: 12px;
    color: var(--color-stone);
  }

  .muted .stat-value {
    color: var(--color-stone);
  }

  /* 1. Главный блок: аватар, название (зелёное — сервер подключён к Pixplaze), адрес */
  .hero {
    flex-direction: row;
    align-items: center;
    gap: 20px;

    :global(.server-icon) {
      border-radius: var(--ui-radius);
      image-rendering: pixelated;
      box-shadow: var(--ui-nb-shadow);
    }
  }

  .hero-info {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    min-width: 0;
  }

  h1 {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 36px;
    font-weight: 400;
    line-height: 1.1;
    overflow-wrap: anywhere;

    &.linked {
      color: var(--color-green-deep);
    }
  }

  /* Адрес — спокойная кнопка: обведена, без заливки и тени */
  .ip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    max-width: 100%;
    height: 36px;
    padding: 0 10px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background-color: transparent;
    border: 2px solid var(--color-stone-light);
    border-radius: var(--ui-radius);
    cursor: pointer;
    transition: background-color .12s ease-out, border-color .12s ease-out;

    span {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    &:hover {
      background-color: var(--color-sandstone);
      border-color: var(--color-outline);
    }

    &:active {
      background-color: var(--color-stone-light);
    }
  }

  /* 2. Показатели — ячейки в ряд, разделены тонкими линиями; сколько есть, столько и делят ширину */
  .stats {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
    gap: 12px 0;
  }

  .stat-cell {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
    padding: 0 16px;
    border-left: 1px solid var(--color-stone-light);

    &:first-child {
      padding-left: 0;
      border-left: none;
    }
  }

  .rating-cell :global(.stat-label .icon) {
    color: var(--color-gold);
  }

  .vote {
    margin-top: 4px;

    :global(.rating) {
      --rating-color: var(--color-gold);
      --rating-hover-color: var(--color-gold);
      color: var(--color-stone-light);
    }
  }

  /* 3. О сервере: длинный текст свёрнут до 6 строк, ниже — теги */
  .about {
    gap: 10px;
  }

  /* 18 px, а не глобальные 16: пиксельный шрифт чёткий на кеглях, кратных 6 */
  .about-text {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 18px;
    line-height: 1.4;
    white-space: pre-line;
    overflow-wrap: anywhere;

    &.clamped {
      display: -webkit-box;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 6;
      line-clamp: 6;
      overflow: hidden;
    }
  }

  .more {
    align-self: flex-start;
    padding: 0;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-green-deep);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin: 4px 0 0;
    padding: 0;
    list-style: none;
  }

  /* Тег — как чип фильтра в поиске, ведёт в поиск с этим фильтром */
  .tag {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 12px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    text-decoration: none;
    background-color: var(--color-sandstone);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    transition: background-color .12s ease-out, color .12s ease-out;

    &:hover {
      color: var(--color-birch);
      background-color: var(--color-green-main);
      border-color: var(--color-green-deep);
    }
  }

  .friends {
    ul {
      display: flex;
      flex-direction: column;
      gap: 6px;
      margin: 0;
      padding: 0;
      list-style: none;
    }

    li {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: 8px;
      font-family: var(--font-ui);
    }

    b {
      font-weight: 400;
      color: var(--color-green-deep);
    }

    span {
      font-size: 12px;
      color: var(--color-stone);
    }
  }

  .soon .stat-value {
    color: var(--color-redstone);
  }

  .actions {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;

    .stat-note {
      flex-basis: 100%;
    }
  }

  .action {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 40px;
    padding: 0 12px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
    cursor: pointer;
    text-align: left;

    &:hover {
      background-color: var(--color-sandstone);
    }

    &:active {
      transform: translate(2px, 2px);
      box-shadow: none;
    }
  }

  .notice {
    background-color: var(--color-sandstone);

    p {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 12px;
      line-height: 1.4;
      color: var(--color-stone);
    }

    a {
      font-family: var(--font-ui);
      color: var(--color-green-deep);
    }
  }

  .action:focus-visible,
  .ip:focus-visible,
  .more:focus-visible,
  .tag:focus-visible {
    outline: var(--ui-size-border) solid var(--color-ui-focus);
    outline-offset: 2px;
  }

  @media screen and (max-width: 1000px) {
    .bento {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media screen and (max-width: 440px) {
    .server-page {
      --server-icon-size: 80px;
    }

    .bento {
      gap: 12px;
    }

    .wide {
      grid-column: 1 / -1;
    }

    .hero {
      gap: 14px;
    }

    h1 {
      font-size: 24px;
    }

    /* Телефон: показатели два на два */
    .stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .stat-cell:nth-child(odd) {
      padding-left: 0;
      border-left: none;
    }

    .stat-value {
      font-size: 24px;
    }
  }
</style>
