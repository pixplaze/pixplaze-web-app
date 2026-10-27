<script>
  import {onMount} from 'svelte';
  import {ProfilePlayers} from '$components/profile/ProfilePlayers.svelte.js';
  import {formatServerWhere} from '$util/server.mapper.js';
  import PlayerRow from '$components/players/PlayerRow.svelte';
  import Delimiter from '$ui/Delimiter.svelte';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import Button from '$ui/buttons/Button.svelte';
  import Notice from '$ui/Notice.svelte';
  import Icon from "$ui/Icon.svelte";

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

  const setPrimary = (playerUuid, minecraftServerId) => {
    state.setPrimary(playerUuid, minecraftServerId)
  }
</script>

{#if state.failed}
  <Notice notices={[{level: 'error', message: 'Не удалось загрузить персонажей'}]} closeable={false}/>
{:else if state.players.length}
  <Delimiter value="персонажи"/>
  <div class="players">
    {#each state.players as player (player.uuid)}
      {@const online = state.playerOnline(player.uuid)}
      {@const isOperator = online && player.servers.some(s => s.minecraftServerId === online.server.id && s.isOperator)}
      <!-- Где игрок в сети; оператор ли он на этом сервере -->
      {#snippet onlineInfo()}
        в сети на {formatServerWhere(online.server)}
        <!--{#if isOperator}-->
        <!--  <Icon icon="operator" classes="player-operator"/>-->
        <!--{/if}-->
      {/snippet}
<!--      <div class="player">-->
        <PlayerRow skinHeadBase64={player.skinHeadBase64}
                   name={player.username}
                   subtitle={online ? onlineInfo : undefined}
                   online={!!online}
                   {isOperator}>
          {#snippet actions()}
            <ButtonIcon title="Отвязать игрока"
                        icon="unlink"
                        onclick={() => unlink(player)}/>
          {/snippet}
        </PlayerRow>
        {#each player.servers as server (server.minecraftServerId)}
          <div class="player-server">
            <span>{server.name}</span>
            {#if server.isPrimary}
              <span class="player-primary">основной</span>
            {:else}
              <Button title="Работать с сервером от имени этого игрока"
                      onclick={() => setPrimary(player.uuid, server.minecraftServerId)}
              >Сделать основным</Button>
            {/if}
          </div>
        {/each}
<!--      </div>-->
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
  }

  .player-server {
    display: flex;
    align-items: center;
    box-sizing: border-box;
    justify-content: space-between;
    padding: calc(var(--ui-padding) / 2) var(--ui-padding);
    border-top: var(--ui-size-border) solid #333333;
    height: var(--ui-size-block);
  }

  .player-primary {
    opacity: .8;
  }
</style>
