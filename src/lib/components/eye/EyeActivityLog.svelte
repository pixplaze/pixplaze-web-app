<script>
  import Icon from '$ui/Icon.svelte';
  import EyeActivityRow from '$components/eye/EyeActivityRow.svelte';
  import {ACTION_GROUPS, WORLDS, WORLD_NAMES} from '$scripts/eye/eye.source.js';
  import {PERIODS} from '$scripts/eye/eye.svelte.js';
  import {dayLabel, fullTime, tpCommand} from '$components/eye/eyeFormat.js';
  import {copyToClipboard} from '$util/dom.util.js';
  import {pointerHint} from '$scripts/pointerHint.svelte.js';

  /**
   * Журнал действий игрока: фильтры по типу, периоду и миру, записи по дням.
   * Время записи — показать, что игрок делал за 15 минут до и после; координаты — скопировать /tp
   * и показать всё, что происходило рядом с этой точкой.
   */
  let {eye} = $props();

  const PAGE = 80;
  let limit = $state(PAGE);

  const byDay = $derived.by(() => {
    const days = [];
    for (const activity of eye.activities.slice(0, limit)) {
      const key = activity.at.toDateString();
      const last = days.at(-1);
      if (last?.key === key) last.items.push(activity);
      else days.push({key, label: dayLabel(activity.at), items: [activity]});
    }
    return days;
  });

  $effect(() => {
    eye.selectedUuid;
    limit = PAGE;
  });

  /** Сначала фильтр по месту, потом копирование: буфер обмена бывает недоступен, фильтр от этого не страдает. */
  const onPlace = async (event, activity) => {
    eye.showNear(activity);
    try {
      await copyToClipboard(tpCommand(activity));
      pointerHint.show('Команда /tp скопирована', event);
    } catch {
      pointerHint.show('Не удалось скопировать /tp', event);
    }
  };
</script>

<!-- div, а не section: раскладка задаёт отступы всем section страницы -->
<div class="log" role="region" aria-label="Журнал действий">
  <div class="toolbar">
    <div class="chips" role="group" aria-label="Тип действия">
      {#each ACTION_GROUPS as group (group.id)}
        <button type="button" class="chip" aria-pressed={eye.groups.has(group.id)} onclick={() => eye.toggleGroup(group.id)}>
          <Icon icon={group.icon}/>{group.label}
        </button>
      {/each}
    </div>

    <div class="selects">
      <div class="segmented" role="group" aria-label="Период">
        {#each PERIODS as period (period.id)}
          <button type="button" class="segment" aria-pressed={!eye.around && eye.period === period.id}
                  onclick={() => eye.setPeriod(period.id)}>{period.label}</button>
        {/each}
      </div>
      <select class="world" aria-label="Мир" value={eye.world ?? ''} onchange={(e) => eye.setWorld(e.currentTarget.value || null)}>
        <option value="">Все миры</option>
        {#each WORLDS as world (world)}
          <option value={world}>{WORLD_NAMES[world]}</option>
        {/each}
      </select>
    </div>

    {#if eye.near || eye.around}
      <div class="context">
        {#if eye.near}
          <span class="context-chip">
            Рядом с {eye.near.x} {eye.near.y} {eye.near.z} ({WORLD_NAMES[eye.near.world]}), ±{eye.near.radius} блоков
            <button type="button" aria-label="Убрать фильтр по месту" onclick={() => { eye.near = null; eye.reload(); }}><Icon icon="close"/></button>
          </span>
        {/if}
        {#if eye.around}
          <span class="context-chip">
            ±15 минут от {fullTime(eye.around)}
            <button type="button" aria-label="Убрать фильтр по времени" onclick={() => { eye.around = null; eye.reload(); }}><Icon icon="close"/></button>
          </span>
        {/if}
      </div>
    {/if}
  </div>

  <p class="found" aria-live="polite">
    {#if eye.activitiesLoading}Загрузка…{:else}Записей: {eye.activities.length}{/if}
    {#if eye.hasFilters}<button type="button" class="reset" onclick={() => eye.resetFilters()}>Сбросить фильтры</button>{/if}
  </p>

  {#each byDay as day (day.key)}
    <h3 class="day">{day.label}</h3>
    <ol class="entries">
      {#each day.items as activity (activity.id)}
        <EyeActivityRow {activity} onTime={(a) => eye.showAround(a.at)} {onPlace}
                        placeTitle="Скопировать /tp и показать, что было рядом"/>
      {/each}
    </ol>
  {:else}
    {#if !eye.activitiesLoading}
      <p class="empty">За выбранный период действий нет</p>
    {/if}
  {/each}

  {#if eye.activities.length > limit}
    <button type="button" class="more" onclick={() => limit += PAGE}>
      Показать ещё {Math.min(PAGE, eye.activities.length - limit)}
    </button>
  {/if}
</div>

<style>
  .log {
    display: flex;
    flex-direction: column;
    gap: 8px;
    font-family: var(--font-ui);
  }

  span, select, option {
    font-family: var(--font-ui);
  }

  .toolbar {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip,
  .segment {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    height: 32px;
    padding: 0 10px 0 6px;
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

  .selects {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .segmented {
    display: flex;
  }

  .segment {
    padding: 0 10px;
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

  .world {
    height: 32px;
    padding: 0 8px;
    font-size: 12px;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
  }

  .context {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .context-chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 2px 4px 2px 10px;
    font-size: 12px;
    color: var(--color-coal);
    background-color: #F3E3B8;
    border: 2px solid var(--color-gold);
    border-radius: var(--ui-radius);

    button {
      display: grid;
      place-items: center;
      padding: 0;
      color: inherit;
      background: none;
      border: none;
      cursor: pointer;
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

  .reset,
  .more {
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

  .more {
    align-self: flex-start;
    font-size: 18px;
  }

  .day {
    margin: 8px 0 0;
    font-family: var(--font-ui);
    font-size: 12px;
    font-weight: 400;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--color-stone);
  }

  .entries {
    margin: 0;
    padding: 0;
    list-style: none;
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
  }

  .empty {
    margin: 0;
    padding: 16px 0;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-stone);
  }
</style>
