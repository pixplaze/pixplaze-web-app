<script>
  import {SvelteSet} from 'svelte/reactivity';
  import {page} from '$app/state';
  import ServerCard from '$components/servers/ServerCard.svelte';
  import Input from '$ui/inputs/Input.svelte';
  import Loader from '$ui/indicators/Loader.svelte';
  import {ServerSearch} from '$components/servers/ServerList.svelte.js';
  import {SERVER_FILTERS, SERVER_SORTS, applyServerFilters} from '$util/server.filters.js';
  import {auth} from '$scripts/auth.svelte.js';
  import {favorites} from '$scripts/favorites.svelte.js';
  import {friends} from '$scripts/friends.svelte.js';
  import {currentUser} from '$scripts/user.svelte.js';

  /** servers — исходный листинг (SSR `load`), показывается при пустом поиске. */
  const {servers} = $props();

  // svelte-ignore state_referenced_locally
  const search = new ServerSearch(servers);

  /**
   * Фильтры и сортировка применяются к результату поиска на клиенте. Начальные фильтры — из `?filter=`
   * (теги на странице сервера ведут сюда); неизвестные значения пропускаются.
   */
  const filters = new SvelteSet(page.url.searchParams.getAll('filter')
      .filter((id) => SERVER_FILTERS.some((filter) => filter.id === id)));
  let sort = $state(SERVER_SORTS[0].id);

  const shown = $derived(applyServerFilters(search.servers, filters, sort));

  // Друзья в сети — для плашки на подключённых серверах; ошибка не мешает листингу, плашки просто нет
  $effect(() => {
    const profileId = currentUser.value?.id;
    if (profileId) friends.loadOnline(profileId).catch(() => {});
  });

  const toggleFilter = (id) => filters.has(id) ? filters.delete(id) : filters.add(id);

  const resetFilters = () => {
    filters.clear();
    search.query = '';
  };

  /** Стрелки внутри группы сортировки — как у радиокнопок. */
  const onSortKeydown = (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) return;
    event.preventDefault();
    const step = event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 1;
    const index = SERVER_SORTS.findIndex((s) => s.id === sort);
    sort = SERVER_SORTS[(index + step + SERVER_SORTS.length) % SERVER_SORTS.length].id;
    event.currentTarget.querySelector(`[data-sort="${sort}"]`)?.focus();
  };

  const plural = (n) => {
    const mod10 = n % 10, mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return 'сервер';
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'сервера';
    return 'серверов';
  };
</script>

<section class="server-search">
  <h1>Поиск Minecraft серверов</h1>
  <Input id="servers-search" placeholder="Название, адрес или описание…" bind:value={search.query}/>
  <Loader loading={search.loading}/>

  <div class="server-controls">
    <div class="chip-group" role="group" aria-label="Фильтры">
      {#each SERVER_FILTERS as filter (filter.id)}
        <button type="button" class="chip" title={filter.title}
                aria-pressed={filters.has(filter.id)}
                onclick={() => toggleFilter(filter.id)}>{filter.label}</button>
      {/each}
    </div>

    <div class="sort">
      <span class="sort-label" id="servers-sort-label">Сортировка</span>
      <div class="segmented" role="radiogroup" aria-labelledby="servers-sort-label" tabindex="-1"
           onkeydown={onSortKeydown}>
        {#each SERVER_SORTS as option (option.id)}
          <button type="button" role="radio" class="segment" data-sort={option.id}
                  aria-checked={sort === option.id}
                  tabindex={sort === option.id ? 0 : -1}
                  onclick={() => sort = option.id}>{option.label}</button>
        {/each}
      </div>
    </div>
  </div>

  <p class="server-count" aria-live="polite">Найдено {shown.length} {plural(shown.length)}</p>
</section>

<section class="servers-pane">
  {#if shown.length > 0}
    <div class="server-list">
      {#each shown as server (server.id)}
        <ServerCard {server}
                    friendsOnline={server.isLinked ? friends.onlineOn(server.id) : 0}
                    favorite={auth.isAuthenticated ? favorites.has(server.id) : null}
                    onFavorite={(server) => favorites.has(server.id) ? favorites.remove(server.id) : favorites.add(server)}/>
      {/each}
    </div>
  {:else if !search.loading}
    <div class="server-empty">
      <p>Ничего не нашлось</p>
      <button type="button" class="chip" onclick={resetFilters}>Сбросить поиск и фильтры</button>
    </div>
  {/if}
</section>

<style>
  section {
    padding-top: var(--ui-spacing);
    font-family: var(--font-ui);
    font-synthesis: none;
    color: var(--color-coal);
  }

  .server-search > :global(*) {
    margin-bottom: var(--ui-spacing);
  }

  .server-search > .server-count {
    margin-bottom: 0;
  }

  /* Крупный заголовок — Tiny5: в большом кегле он красивый и читается */
  h1 {
    margin: 0;
    font-family: var(--font-ui-title);
    font-size: 32px;
    font-weight: 400;
  }

  /* Поле поиска в стиле карточек: мягкий контур, жёсткая тень, едва заметное скругление */
  .server-search :global(.ui.interactive.input) {
    height: 52px;
    font-family: var(--font-ui);
    font-size: 18px;
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
    transition: box-shadow .12s ease-out, transform .12s ease-out;
  }

  .server-search :global(.ui.interactive.input:focus) {
    transform: translate(-2px, -2px);
    border-color: var(--color-green-deep);
    box-shadow: 5px 5px 0 0 var(--color-green-main);
  }

  .server-search :global(.ui.interactive.input::placeholder) {
    color: var(--color-stone);
    opacity: 1;
  }

  .server-controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 12px 24px;
  }

  .chip-group {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  /* Переключатель-«чип»: нажат — зелёный, как блок травы */
  .chip,
  .segment {
    box-sizing: border-box;
    height: 40px;
    padding: 0 14px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    cursor: pointer;
    user-select: none;
    white-space: nowrap;
    transition: background-color .12s ease-out, box-shadow .12s ease-out, transform .12s ease-out;
  }

  .chip {
    box-shadow: var(--ui-nb-shadow);

    &:hover {
      background-color: var(--color-sandstone);
    }

    &:active {
      transform: translate(2px, 2px);
      box-shadow: 1px 1px 0 0 var(--color-outline-shadow);
    }

    &[aria-pressed="true"] {
      color: var(--color-birch);
      background-color: var(--color-green-main);
      border-color: var(--color-green-deep);
      box-shadow: 3px 3px 0 0 var(--color-green-deep);
    }
  }

  .sort {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .sort-label {
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-stone);
  }

  /* Сегменты сортировки — одна плашка, выбранный сегмент залит */
  .segmented {
    display: flex;
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
  }

  .segment {
    border-radius: 0;

    &:first-child {
      border-radius: var(--ui-radius) 0 0 var(--ui-radius);
    }

    &:last-child {
      margin-left: -2px;
      border-radius: 0 var(--ui-radius) var(--ui-radius) 0;
    }

    &:hover {
      background-color: var(--color-sandstone);
    }

    &[aria-checked="true"] {
      position: relative;
      color: var(--color-birch);
      background-color: var(--color-green-main);
      border-color: var(--color-green-deep);
    }
  }

  .chip:focus-visible,
  .segment:focus-visible {
    outline: var(--ui-size-border) solid var(--color-ui-focus);
    outline-offset: 2px;
  }

  .server-count {
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-stone);
  }

  /* Колонок не больше --server-list-cols и не уже 400 px: в плитке хватает места, чтобы версия помещалась
     целиком. На очень широких экранах — четыре, иначе плитки растягиваются, а содержимое жмётся влево */
  .server-list {
    --server-list-gap: var(--ui-spacing);
    --server-list-cols: 3;
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(max(min(400px, 100%), calc((100% - (var(--server-list-cols) - 1) * var(--server-list-gap)) / var(--server-list-cols))), 1fr));
    gap: calc(var(--server-list-gap) + 4px) var(--server-list-gap);
    width: 100%;
    /* Место под тень и подъём карточки при наведении */
    padding: 2px 6px 8px 2px;
  }

  @media screen and (min-width: 1900px) {
    .server-list {
      --server-list-cols: 4;
    }
  }

  /* Узкий экран: сортировка на всю ширину, сегменты поровну */
  @media screen and (max-width: 440px) {
    .sort {
      width: 100%;
    }

    .segmented {
      flex: 1;
    }

    .segment {
      flex: 1;
      padding: 0 8px;
    }
  }

  .server-empty {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
    padding: 24px 0;

    p {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 24px;
      color: var(--color-stone);
    }
  }
</style>
