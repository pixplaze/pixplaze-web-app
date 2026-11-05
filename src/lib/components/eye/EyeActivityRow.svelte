<script>
  import Icon from '$ui/Icon.svelte';
  import {ACTIONS, WORLD_NAMES} from '$scripts/eye/eye.source.js';
  import {clockTime, describeActivity, fullTime, tpCommand} from '$components/eye/eyeFormat.js';

  /**
   * Строка журнала: время | что сделал | где. Время и место — кнопки:
   * onTime(activity) — контекст по времени, onPlace(event, activity) — по месту.
   * timeTitle — подсказка к кнопке времени, note — мелкая подпись под временем (например, «за 12 мин»).
   */
  let {activity, onTime, onPlace, timeTitle = 'Что делал за 15 минут до и после', placeTitle = 'Скопировать /tp', note = null} = $props();

  const text = $derived(describeActivity(activity));
</script>

<li class="entry" data-action={activity.action}>
  <button type="button" class="time" title="{timeTitle} — {fullTime(activity.at)}" onclick={() => onTime(activity)}>
    {clockTime(activity.at)}
    {#if note}<small class="note">{note}</small>{/if}
  </button>
  <span class="what">
    <span class="action-icon"><Icon icon={ACTIONS[activity.action]?.icon ?? 'info'}/></span>
    <span class="verb">{text.verb}</span>
    {#if text.subject}
      {#if activity.action === 'player-chat'}
        <q class="subject">{text.subject}</q>
      {:else}
        <b class="subject">{text.subject}</b>
      {/if}
    {/if}
    {#if text.target}<span class="target">— {text.target}</span>{/if}
  </span>
  <button type="button" class="place" title="{placeTitle}: {tpCommand(activity)}" onclick={(e) => onPlace(e, activity)}>
    {#if activity.world !== 'world'}<span class="world-mark">{WORLD_NAMES[activity.world]}</span>{/if}
    {activity.x} {activity.y} {activity.z}
  </button>
</li>

<style>
  span, q, b, small {
    font-family: var(--font-ui);
  }

  .entry {
    display: grid;
    grid-template-columns: 72px minmax(0, 1fr) auto;
    align-items: center;
    gap: 10px;
    padding: 4px 10px;
    font-size: 18px;

    & + & {
      border-top: 1px solid var(--color-sandstone);
    }
  }

  .time,
  .place {
    padding: 2px 4px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-stone);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--ui-radius);
    cursor: pointer;

    &:hover {
      color: var(--color-coal);
      border-color: var(--color-stone-light);
    }

    &:focus-visible {
      outline: var(--ui-size-border) solid var(--color-ui-focus);
    }
  }

  .time {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    text-align: left;
  }

  .note {
    font-size: 12px;
    white-space: nowrap;
    color: var(--color-stone);
    opacity: .8;
  }

  .place {
    white-space: nowrap;
  }

  .world-mark {
    margin-right: 4px;
    color: var(--color-redstone);
  }

  .what {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .action-icon {
    display: grid;
    place-items: center;
    color: var(--color-stone);
  }

  /* Действия, на которые модератор смотрит в первую очередь, — цветом пиктограммы */
  .entry[data-action="item-remove"] .action-icon,
  .entry[data-action="entity-death"] .action-icon,
  .entry[data-action="complaint-received"] .action-icon {
    color: var(--color-redstone);
  }

  .entry[data-action="complaint-filed"] .action-icon {
    color: var(--color-gold);
  }

  .entry[data-action="block-place"] .action-icon {
    color: var(--color-green-deep);
  }

  .verb {
    color: var(--color-stone);
  }

  .subject {
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  .target {
    font-size: 12px;
    color: var(--color-stone);
  }

  @media screen and (max-width: 600px) {
    .entry {
      grid-template-columns: 68px minmax(0, 1fr);
    }

    .place {
      grid-column: 2;
      justify-self: start;
    }
  }
</style>
