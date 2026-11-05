<script>
  import {flip} from 'svelte/animate';
  import EyeComplaintCard from '$components/eye/EyeComplaintCard.svelte';
  import {COMPLAINT_CATEGORIES} from '$scripts/eye/eye.source.js';
  import {COMPLAINT_PERIODS, eyeFor} from '$scripts/eye/eye.svelte.js';
  import {currentUser} from '$scripts/user.svelte.js';

  /**
   * Вкладка «Жалобы» панели: все непросмотренные жалобы сервера, новые сверху.
   * Отмеченная «просмотрено» уезжает вниз и остаётся там до ухода со страницы — отметку можно снять.
   * onOpen() — перейти во вкладку «Око Саурона» (после открытия досье или журнала из жалобы).
   */
  let {serverId, onOpen} = $props();

  // svelte-ignore state_referenced_locally
  const eye = eyeFor(serverId, currentUser.value?.name ?? 'модератор');

  $effect(() => {
    eye.ensureLoaded();
  });

  const openPlayer = (uuid) => {
    eye.openPlayer(uuid);
    onOpen();
  };

  const openLog = (uuid, at) => {
    eye.openLogAround(uuid, at);
    onOpen();
  };
</script>

<div class="inbox" role="region" aria-label="Жалобы сервера">
  <div class="toolbar">
    <div class="chips" role="group" aria-label="Категория">
      {#each COMPLAINT_CATEGORIES as category (category)}
        <button type="button" class="chip" aria-pressed={eye.inboxCategories.has(category)}
                onclick={() => eye.toggleInboxCategory(category)}>{category}</button>
      {/each}
    </div>
    <div class="segmented" role="group" aria-label="Период">
      {#each COMPLAINT_PERIODS as period (period.id)}
        <button type="button" class="segment" aria-pressed={eye.inboxPeriod === period.id}
                onclick={() => eye.inboxPeriod = period.id}>{period.label}</button>
      {/each}
    </div>
  </div>

  <p class="found" aria-live="polite">
    {#if eye.inboxLoading}Загрузка…{:else}Непросмотренных: {eye.unreviewedCount}{/if}
    {#if eye.hasInboxFilters}
      <button type="button" class="reset" onclick={() => eye.resetInboxFilters()}>Сбросить фильтры</button>
    {/if}
  </p>

  {#each eye.shownInbox as complaint, i (complaint.id)}
    <div animate:flip={{duration: 300}}>
      <EyeComplaintCard {eye} {complaint} server initiallyOpen={i === 0 && !complaint.reviewed}
                        onOpenPlayer={openPlayer} onOpenLog={openLog}/>
    </div>
  {:else}
    {#if !eye.inboxLoading}
      <p class="empty">
        {#if eye.hasInboxFilters}Под фильтры ничего не подходит{:else}Все жалобы просмотрены{/if}
      </p>
    {/if}
  {/each}
</div>

<style>
  .inbox {
    display: flex;
    flex-direction: column;
    gap: 10px;
    max-width: 980px;
    font-family: var(--font-ui);
  }

  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px 12px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .segmented {
    display: flex;
  }

  .chip,
  .segment {
    display: inline-flex;
    align-items: center;
    height: 32px;
    padding: 0 10px;
    font-family: var(--font-ui);
    font-size: 12px;
    white-space: nowrap;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    cursor: pointer;

    &:hover {
      background-color: var(--color-sandstone);
    }

    &[aria-pressed="true"] {
      color: var(--color-birch);
      background-color: var(--color-green-main);
      border-color: var(--color-green-deep);
    }
  }

  .segment {
    border-radius: 0;

    &:first-child {
      border-radius: var(--ui-radius) 0 0 var(--ui-radius);
    }

    &:last-child {
      border-radius: 0 var(--ui-radius) var(--ui-radius) 0;
    }

    & + & {
      margin-left: -2px;
    }
  }

  .found {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 0;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-stone);
  }

  .reset {
    padding: 0;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-green-deep);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .empty {
    margin: 0;
    padding: 16px 0;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-stone);
  }
</style>
