<script>
  import {SvelteSet} from 'svelte/reactivity';
  import Icon from '$ui/Icon.svelte';
  import EyeActivityRow from '$components/eye/EyeActivityRow.svelte';
  import {ACTION_GROUPS, WORLD_NAMES} from '$scripts/eye/eye.source.js';
  import {clockTime, dayLabel, offsetLabel, relativeTime, tpCommand} from '$components/eye/eyeFormat.js';
  import {copyToClipboard} from '$util/dom.util.js';
  import {pointerHint} from '$scripts/pointerHint.svelte.js';

  /**
   * Жалоба: кто, на кого, за что, когда и где — и действия обвиняемого за 2 часа до и 30 минут после.
   * Действия загружаются при первом раскрытии; фильтры (тип действия, рядом с местом жалобы) — свои у каждой жалобы.
   * Галочка «просмотрено» сворачивает жалобу; список сам опускает её под непросмотренные.
   * server — карточка во вкладке «Жалобы» сервера: видны и автор, и обвиняемый.
   * onOpenPlayer(uuid), onOpenLog(uuid, at) — переходы в досье; во вкладке сервера ещё и переключают вкладку.
   */
  let {
    eye, complaint, initiallyOpen = false, server = false,
    onOpenPlayer = (uuid) => eye.openPlayer(uuid),
    onOpenLog = (uuid, at) => eye.openLogAround(uuid, at)
  } = $props();

  const NEAR_RADIUS = 32;

  // svelte-ignore state_referenced_locally
  let open = $state(initiallyOpen);
  let activities = $state(null);
  let loading = $state(false);
  const groups = new SvelteSet();
  let nearOnly = $state(false);

  const against = $derived(server || complaint.accusedUuid === eye.selectedUuid);
  let saving = $state(false);

  const toggleReviewed = async (event) => {
    const reviewed = event.currentTarget.checked;
    saving = true;
    await eye.setReviewed(complaint, reviewed);
    saving = false;
    if (reviewed) open = false;
  };

  $effect(() => {
    if (open && activities === null && !loading) load();
  });

  async function load() {
    loading = true;
    try {
      activities = await eye.complaintWindow(complaint);
    } finally {
      loading = false;
    }
  }

  const isNear = (a) => a.world === complaint.world
      && Math.abs(a.x - complaint.x) <= NEAR_RADIUS && Math.abs(a.z - complaint.z) <= NEAR_RADIUS;

  /** Группы действий, которые вообще есть в окне, — с количеством; пустые чипы не показываем. */
  const presentGroups = $derived(ACTION_GROUPS
      .map((g) => ({...g, count: (activities ?? []).filter((a) => g.actions.includes(a.action)).length}))
      .filter((g) => g.count > 0));

  const shown = $derived((activities ?? []).filter((a) =>
      (!groups.size || ACTION_GROUPS.some((g) => groups.has(g.id) && g.actions.includes(a.action)))
      && (!nearOnly || isNear(a))));
  const before = $derived(shown.filter((a) => a.at < complaint.at));
  const after = $derived(shown.filter((a) => a.at >= complaint.at));

  const toggleGroup = (id) => (groups.has(id) ? groups.delete(id) : groups.add(id));

  const copyTp = async (event, place) => {
    try {
      await copyToClipboard(tpCommand(place));
      pointerHint.show('Команда /tp скопирована', event);
    } catch {
      pointerHint.show('Не удалось скопировать /tp', event);
    }
  };
</script>

<article class="complaint" class:open class:reviewed={complaint.reviewed}>
  <header class="head">
    <span class="flag" class:filed={!against}><Icon icon="flag"/></span>
    <span class="category">{complaint.category}</span>
    {#if server}
      <span class="who">
        <button type="button" class="player-link accused" title="Открыть досье"
                onclick={() => onOpenPlayer(complaint.accusedUuid)}>{complaint.accusedName}</button>
        — от
        <button type="button" class="player-link" title="Открыть досье"
                onclick={() => onOpenPlayer(complaint.authorUuid)}>{complaint.authorName}</button>
      </span>
    {:else}
      <span class="who">
        {against ? 'от' : 'на'}
        <button type="button" class="player-link" title="Открыть досье"
                onclick={() => onOpenPlayer(against ? complaint.authorUuid : complaint.accusedUuid)}>
          {against ? complaint.authorName : complaint.accusedName}
        </button>
      </span>
    {/if}
    <span class="when">{dayLabel(complaint.at)}, {clockTime(complaint.at)}</span>
    <button type="button" class="place" title="Где стоял автор жалобы — скопировать {tpCommand(complaint)}"
            onclick={(e) => copyTp(e, complaint)}>
      {#if complaint.world !== 'world'}<span class="world-mark">{WORLD_NAMES[complaint.world]}</span>{/if}
      {complaint.x} {complaint.y} {complaint.z}
    </button>
  </header>

  <blockquote class="text">{complaint.text}</blockquote>

  <div class="foot">
    <button type="button" class="toggle" aria-expanded={open} onclick={() => open = !open}>
      <span class="chevron" aria-hidden="true">{open ? '▾' : '▸'}</span>
      Действия {complaint.accusedName}: за 2 часа до и 30 минут после
      {#if activities}<span class="count">{activities.length}</span>{/if}
    </button>
    <label class="review">
      <input type="checkbox" checked={!!complaint.reviewed} disabled={saving} onchange={toggleReviewed}/>
      {#if complaint.reviewed}
        Просмотрено <small>— {complaint.reviewed.by}, {relativeTime(complaint.reviewed.at)}</small>
      {:else}
        Отметить как просмотренное
      {/if}
    </label>
  </div>

  {#if open}
    <div class="window">
      {#if loading}
        <p class="empty">Загрузка…</p>
      {:else if activities}
        {#if activities.length}
          <div class="filters">
            <div class="chips" role="group" aria-label="Тип действия">
              {#each presentGroups as group (group.id)}
                <button type="button" class="chip" aria-pressed={groups.has(group.id)} onclick={() => toggleGroup(group.id)}>
                  <Icon icon={group.icon}/>{group.label}<span class="chip-count">{group.count}</span>
                </button>
              {/each}
            </div>
            <label class="near">
              <input type="checkbox" bind:checked={nearOnly}/>
              Только рядом с местом жалобы (±{NEAR_RADIUS} блока)
            </label>
          </div>
        {/if}

        <h4 class="part">За 2 часа до жалобы <span class="part-count">{before.length}</span></h4>
        {#if before.length}
          <ol class="entries">
            {#each before as activity (activity.id)}
              <EyeActivityRow {activity} note={offsetLabel(activity.at, complaint.at)}
                              onTime={(a) => onOpenLog(complaint.accusedUuid, a.at)}
                              timeTitle="Время от жалобы (ч:мин). Открыть в журнале ±15 минут" onPlace={copyTp}/>
            {/each}
          </ol>
        {:else}
          <p class="empty">Ничего</p>
        {/if}

        <div class="marker">
          <Icon icon="flag"/>
          <span><b>Жалоба</b> в {clockTime(complaint.at)} — {complaint.authorName}: «{complaint.text}»</span>
        </div>

        <h4 class="part">30 минут после <span class="part-count">{after.length}</span></h4>
        {#if after.length}
          <ol class="entries">
            {#each after as activity (activity.id)}
              <EyeActivityRow {activity} note={offsetLabel(activity.at, complaint.at)}
                              onTime={(a) => onOpenLog(complaint.accusedUuid, a.at)}
                              timeTitle="Время от жалобы (ч:мин). Открыть в журнале ±15 минут" onPlace={copyTp}/>
            {/each}
          </ol>
        {:else}
          <p class="empty">Ничего</p>
        {/if}
      {/if}
    </div>
  {/if}
</article>

<style>
  .complaint {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px 14px;
    font-family: var(--font-ui);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
  }

  span, b, small, blockquote, label, h4 {
    font-family: var(--font-ui);
  }

  /* Просмотренная — бледнее и без тени: внимание на непросмотренных */
  .complaint.reviewed {
    background-color: var(--color-sandstone);
    box-shadow: none;

    .head,
    .text {
      opacity: .6;
    }
  }

  .foot {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px 16px;
  }

  .review {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--color-coal);
    cursor: pointer;

    input {
      width: 18px;
      height: 18px;
      margin: 0;
      accent-color: var(--color-green-main);
      cursor: inherit;
    }

    small {
      font-size: 12px;
      color: var(--color-stone);
    }
  }

  .head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 10px;
    font-size: 18px;
  }

  .flag {
    display: grid;
    place-items: center;
    color: var(--color-redstone);

    &.filed {
      color: var(--color-gold);
    }
  }

  .category {
    padding: 2px 8px;
    font-size: 12px;
    color: var(--color-birch);
    background-color: var(--color-stone);
    border-radius: var(--ui-radius);
  }

  .who {
    color: var(--color-stone);
  }

  .player-link {
    padding: 0;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background: none;
    border: none;
    border-bottom: 1px dashed var(--color-stone);
    cursor: pointer;

    &:hover {
      color: var(--color-green-deep);
      border-bottom-color: currentColor;
    }
  }

  .when {
    font-size: 12px;
    color: var(--color-stone);
  }

  .place {
    margin-left: auto;
    padding: 2px 4px;
    font-family: var(--font-ui);
    font-size: 12px;
    white-space: nowrap;
    color: var(--color-stone);
    background: none;
    border: 1px solid transparent;
    border-radius: var(--ui-radius);
    cursor: pointer;

    &:hover {
      color: var(--color-coal);
      border-color: var(--color-stone-light);
    }
  }

  .world-mark {
    margin-right: 4px;
    color: var(--color-redstone);
  }

  .text {
    margin: 0;
    padding: 6px 10px;
    font-size: 18px;
    color: var(--color-coal);
    background-color: var(--color-sandstone);
    border-left: 3px solid var(--color-stone-light);
    overflow-wrap: anywhere;
  }

  .toggle {
    display: inline-flex;
    align-items: center;
    align-self: flex-start;
    gap: 6px;
    padding: 0;
    font-family: var(--font-ui);
    font-size: 12px;
    text-align: left;
    color: var(--color-green-deep);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  .count,
  .chip-count,
  .part-count {
    opacity: .7;
  }

  .window {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 4px;
  }

  .filters {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .chip {
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

  .near {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: var(--color-coal);
    cursor: pointer;

    input {
      width: 16px;
      height: 16px;
      margin: 0;
      accent-color: var(--color-green-main);
    }
  }

  .part {
    margin: 6px 0 0;
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
    background-color: #FFFFFF;
    border: 1px solid var(--color-stone-light);
    border-radius: var(--ui-radius);
  }

  /* Момент жалобы — граница между «до» и «после» */
  .marker {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    font-size: 18px;
    color: #7A231B;
    background-color: #F6DEDA;
    border: 2px solid var(--color-redstone);
    border-radius: var(--ui-radius);

    b {
      font-weight: 400;
      text-decoration: underline;
    }

    span {
      overflow-wrap: anywhere;
    }
  }

  .empty {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-stone);
  }

  @media screen and (max-width: 600px) {
    .place {
      margin-left: 0;
    }
  }
</style>
