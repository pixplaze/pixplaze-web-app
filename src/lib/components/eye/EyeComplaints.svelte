<script>
  import {flip} from 'svelte/animate';
  import EyeComplaintCard from '$components/eye/EyeComplaintCard.svelte';
  import {COMPLAINT_CATEGORIES} from '$scripts/eye/eye.source.js';
  import {COMPLAINT_DIRECTIONS, COMPLAINT_PERIODS} from '$scripts/eye/eye.svelte.js';

  /**
   * Жалобы выбранного игрока: на него или от него, с фильтрами по категории и периоду.
   * Первая жалоба раскрыта сразу — модератор видит действия, не делая лишнего клика.
   * Непросмотренные — сверху; отмеченная плавно уезжает под них.
   */
  let {eye} = $props();
</script>

<div class="complaints" role="region" aria-label="Жалобы">
  <div class="toolbar">
    <div class="segmented" role="group" aria-label="Чьи жалобы">
      {#each COMPLAINT_DIRECTIONS as direction (direction.id)}
        <button type="button" class="segment" aria-pressed={eye.complaintDirection === direction.id}
                onclick={() => eye.complaintDirection = direction.id}>
          {direction.label}<span class="count">{eye.complaintCounts[direction.id]}</span>
        </button>
      {/each}
    </div>
    <div class="chips" role="group" aria-label="Категория">
      {#each COMPLAINT_CATEGORIES as category (category)}
        <button type="button" class="chip" aria-pressed={eye.complaintCategories.has(category)}
                onclick={() => eye.toggleComplaintCategory(category)}>{category}</button>
      {/each}
    </div>
    <div class="segmented" role="group" aria-label="Период">
      {#each COMPLAINT_PERIODS as period (period.id)}
        <button type="button" class="segment" aria-pressed={eye.complaintPeriod === period.id}
                onclick={() => eye.complaintPeriod = period.id}>{period.label}</button>
      {/each}
    </div>
  </div>

  <p class="found" aria-live="polite">
    {#if eye.complaintsLoading}Загрузка…{:else}Жалоб: {eye.shownComplaints.length}{/if}
    {#if eye.hasComplaintFilters}
      <button type="button" class="reset" onclick={() => eye.resetComplaintFilters()}>Сбросить фильтры</button>
    {/if}
  </p>

  {#each eye.shownComplaints as complaint, i (complaint.id)}
    <div animate:flip={{duration: 300}}>
      <EyeComplaintCard {eye} {complaint} initiallyOpen={i === 0 && !complaint.reviewed}/>
    </div>
  {:else}
    {#if !eye.complaintsLoading}
      <p class="empty">
        {#if eye.hasComplaintFilters}Под фильтры ничего не подходит
        {:else if eye.complaintDirection === 'against'}На игрока не жаловались
        {:else}Игрок ни на кого не жаловался{/if}
      </p>
    {/if}
  {/each}
</div>

<style>
  .complaints {
    display: flex;
    flex-direction: column;
    gap: 10px;
    font-family: var(--font-ui);
  }

  span {
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
    gap: 6px;
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

  .count {
    opacity: .7;
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
