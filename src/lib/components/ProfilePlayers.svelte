<script>
  import {onMount} from 'svelte';
  import {ProfilePlayers} from './ProfilePlayers.svelte.js';
  import {parseImageBase64} from '$lib/scripts/util/utils.js';
  import {formatServerWhere} from '$lib/scripts/util/server.mapper.js';
  import Delimiter from '$lib/components/ui/Delimiter.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import Button from '$lib/components/ui/buttons/Button.svelte';
  import OnlineIndicator from '$lib/components/ui/OnlineIndicator.svelte';
  import Notice from '$lib/components/ui/Notice.svelte';

  /** Персонажи профиля: онлайн, серверы с основным игроком, отвязка. */
  const {profileId} = $props();

  // svelte-ignore state_referenced_locally
  const state = new ProfilePlayers(profileId);

  onMount(() => state.load());

  const unlink = (player) => {
    if (confirm(`Отвязать игрока ${player.username} от профиля? Войти им в игре снова можно будет только после нового подтверждения.`)) {
      state.unlink(player);
    }
  };
</script>

{#if state.failed}
  <Notice notices={[{level: 'error', message: 'Не удалось загрузить персонажей'}]} closeable={false}/>
{:else if state.players.length}
  <Delimiter value="персонажи"/>
  <div class="players">
    {#each state.players as player (player.uuid)}
      <div class="player">
        <div class="player-row">
          <img src={parseImageBase64(player.skinHeadBase64)} alt="" class="player-icon pixel-art attached">
          <p class="player-name">
            {player.username}
            {#if state.playerOnline(player.uuid)}
              <span class="player-where">в сети на {formatServerWhere(state.playerOnline(player.uuid).server)}</span>
            {/if}
          </p>
          <OnlineIndicator online={!!state.playerOnline(player.uuid)} classes="attached"/>
          <ButtonIcon title="Отвязать игрока"
                      icon="unlink"
                      classes="attached"
                      onclick={() => unlink(player)}/>
        </div>
        {#each player.servers as server (server.minecraftServerId)}
          <div class="player-server">
            <span>{server.name}{server.isOperator ? ' · оператор' : ''}</span>
            {#if server.isPrimary}
              <span class="player-primary">основной</span>
            {:else}
              <Button title="Работать с сервером от имени этого игрока"
                      onclick={() => state.setPrimary(player.uuid, server.minecraftServerId)}>Сделать основным</Button>
            {/if}
          </div>
        {/each}
      </div>
    {/each}
  </div>
{/if}

<style>
  .players {
    display: flex;
    flex-direction: column;
    gap: var(--ui-spacing);
    padding: var(--ui-padding);
    border: var(--color-text-primary) solid var(--ui-size-border);
    background-color: #444444;
  }

  .player {
    border: var(--ui-size-border) solid #333333;
    background-color: #666666;
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  .player-row,
  .player-server {
    display: flex;
    align-items: center;
    /*gap: var(--ui-padding);*/
  }

  .player-server {
    box-sizing: border-box;
    justify-content: space-between;
    padding: calc(var(--ui-padding) / 2) var(--ui-padding);
    border-top: var(--ui-size-border) solid #333333;
    height: var(--ui-size-block);
  }

  .player-icon {
    width: var(--ui-size-block);
    height: var(--ui-size-block);
    border: var(--ui-size-border) solid var(--color-ui-border);
    margin-right: var(--ui-spacing);
  }

  .player-name {
    margin: 0 auto 0 0;
  }

  .player-where {
    display: block;
    font-size: .8em;
    opacity: .8;
  }

  .player-primary {
    opacity: .8;
  }

  :global {
    .player-row {
      button.button {
        border: var(--ui-size-border) solid #333333;
        background-color: #666666;
        box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
      }

      button.button:hover {
        background-color: #888888;
      }

      button.button:active {
        border-color: #666666;
        background-color: #444444;
      }
    }
  }
</style>
