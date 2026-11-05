<script>
  import Icon from '$ui/Icon.svelte';
  import {PLAYER_FILTERS} from '$scripts/eye/eye.svelte.js';
  import EyeAvatar from '$components/eye/EyeAvatar.svelte';
  import {relativeTime} from '$components/eye/eyeFormat.js';

  /**
   * Список досье: поиск, фильтры и игроки; подозреваемые и забаненные — сверху.
   * onSelect — выбор игрока (по умолчанию просто выбрать в eye; на телефоне владелец ещё открывает досье).
   */
  let {eye, onSelect = (uuid) => eye.select(uuid)} = $props();
</script>

<div class="player-list">
  <input class="search" type="search" placeholder="Ник игрока…" aria-label="Поиск игрока"
         bind:value={eye.query}/>

  <div class="filters" role="group" aria-label="Фильтр досье">
    {#each PLAYER_FILTERS as filter (filter.id)}
      <button type="button" class="filter" aria-pressed={eye.playerFilter === filter.id}
              onclick={() => eye.playerFilter = filter.id}>
        {filter.label}<span class="count">{eye.counts[filter.id]}</span>
      </button>
    {/each}
  </div>

  <ul class="players">
    {#each eye.shownPlayers as player (player.uuid)}
      <li>
        <button type="button" class="player" aria-current={eye.selectedUuid === player.uuid}
                onclick={() => onSelect(player.uuid)}>
          <EyeAvatar {player}/>
          <span class="who">
            <span class="name">{player.name}</span>
            <span class="meta">
              {#if player.online}<span class="online">в игре</span>{:else}{relativeTime(player.lastSeen)}{/if}
            </span>
          </span>
          <span class="marks">
            {#if player.suspect}<span class="mark suspect" title="Подозреваемый"><Icon icon="eye"/></span>{/if}
            {#if player.ban}<span class="mark banned" title="Забанен"><Icon icon="lock"/></span>{/if}
            {#if player.mute}<span class="mark banned" title="Замучен"><Icon icon="mute"/></span>{/if}
            {#if player.isOperator}<span class="mark op" title="Оператор"><Icon icon="operator"/></span>{/if}
          </span>
        </button>
      </li>
    {:else}
      <li class="empty">{eye.loading ? 'Загрузка…' : 'Никого не нашлось'}</li>
    {/each}
  </ul>
</div>

<style>
  .player-list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    min-height: 0;
    font-family: var(--font-ui);
  }

  span {
    font-family: var(--font-ui);
  }

  .search {
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    padding: 0 12px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    outline: none;

    &:focus {
      border-color: var(--color-green-deep);
    }

    &::placeholder {
      color: var(--color-stone);
    }
  }

  .filters {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .filter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    font-family: var(--font-ui);
    font-size: 12px;
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

  .count {
    opacity: .7;
  }

  .players {
    display: flex;
    flex-direction: column;
    gap: 4px;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    list-style: none;
  }

  .player {
    box-sizing: border-box;
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 6px 8px;
    text-align: left;
    color: var(--color-coal);
    background: transparent;
    border: 2px solid transparent;
    border-radius: var(--ui-radius);
    cursor: pointer;

    &:hover {
      background-color: var(--color-sandstone);
    }

    &[aria-current="true"] {
      background-color: var(--color-birch);
      border-color: var(--color-outline);
      box-shadow: var(--ui-nb-shadow);
    }

    &:focus-visible {
      outline: var(--ui-size-border) solid var(--color-ui-focus);
      outline-offset: 1px;
    }
  }

  .who {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
  }

  .name {
    overflow: hidden;
    font-size: 18px;
    white-space: nowrap;
    text-overflow: ellipsis;
  }

  .meta {
    font-size: 12px;
    color: var(--color-stone);
  }

  .online {
    color: var(--color-green-deep);
  }

  .marks {
    display: flex;
    gap: 2px;
  }

  .mark {
    display: grid;
    place-items: center;
  }

  .suspect {
    color: var(--color-gold);
  }

  .banned {
    color: var(--color-redstone);
  }

  .op {
    color: var(--color-stone);
  }

  .empty {
    padding: 12px 8px;
    font-size: 18px;
    color: var(--color-stone);
  }
</style>
