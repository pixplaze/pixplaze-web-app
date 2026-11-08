<script>
  import Rating from '$ui/indicators/Rating.svelte';
  import ButtonIcon from '$ui/buttons/ButtonIcon.svelte';
  import MinecraftText from '$ui/text/MinecraftText.svelte';
  import {copyToClipboard} from '$util/dom.util.js';
  import {createDistinctDebounce} from '$util/debounce.util.js';
  import {navigation} from '$scripts/navigation.js';
  import {serversApi} from '$api/servers.api.js';
  import {notifications} from '$scripts/notifications.svelte.js';
  import AlternatingText from '$ui/text/AlternatingText.svelte';
  import ServerIcon from '$components/servers/ServerIcon.svelte';
  import ServerState from "$components/servers/ServerStatus.svelte";
  import {temp} from "$scripts/mixins/temp.svelte.js";
  import ServerMotd from "$components/servers/ServerMotd.svelte";

  /**
   * favorite — сервер в избранном; null — избранное недоступно (гость), звезда скрыта.
   * onFavorite — клик по звезде; что делать, решает владелец карточки.
   */
  let {
    server,
    favorite = null,
    onFavorite
  } = $props();

  let copyIcon = temp('copy', 1500);
  let expanded = $state(true);

  const onMore = () => {
    navigation.goToServersControl(server.id);
  }

  const onCopy = async () => {
    await copyToClipboard(server.host);
    copyIcon.value = 'arrow-ok';
  };

  const rateServer = createDistinctDebounce((rating) => serversApi.rate(server.id, rating), 1000);

  const onVoted = (rating) => {
    rateServer.run(rating).catch((e) => {
      if (e.name !== 'AbortError') {
        notifications.error('Вы не можете голосовать за этот сервер!');
      }
    });
  };

  $effect(() => {
    if (server.name === 'MineDest') {
      console.log(server);
    }
  });

  </script>

<div class="server-card">
  <div class="ui box server-card-box" class:integrated={server.state.integrationStatus === 'PLUGIN'}>
    <ServerIcon src={server.image} alt="Server Icon" framed/>
    <div class="server-info">
      <div class="description">
        <!-- Название и игровой адрес сменяют друг друга; адреса нет — только название -->
        {#snippet address()}{server.host}{/snippet}
        <h2>
          <AlternatingText alternate={server.host ? address : undefined}>
            {#snippet primary()}{server.name}{/snippet}
          </AlternatingText>
        </h2>
        <ServerState core={server.core} state={server.state} --padding="5px"/>
        <Rating value={server.rating} {onVoted}/>
      </div>
      <div class="buttons">
        <ButtonIcon icon={copyIcon.value} classes="transparent {copyIcon ? 'copied' : ''}" onclick={onCopy}/>
        <ButtonIcon icon="more" classes="transparent" onclick={onMore}/>
        {#if favorite !== null}
          <ButtonIcon icons={favorite ? ['star-filled'] : ['star', 'star-filled']}
                      classes="transparent" onclick={() => onFavorite?.(server)}/>
        {/if}
      </div>
    </div>
  </div>

  {#if expanded && server.state && server.core && server.state.players}
    <div class="server-state-box">
      <ServerState state={server.state} core={server.core}/>
      <ServerMotd motd={server.motd}/>
    </div>
  {/if}
</div>
<style>
  .ui.box {
    box-sizing: border-box;
    overflow: hidden;
  }

  .server-card-box {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    position: relative;
    z-index: 1;
    overflow: hidden;
    min-width: 256px;
    height: 128px;
    --server-icon-size: 128px;
    box-shadow: 0 6px 0 0 var(--color-ui-shadow);

    border: var(--ui-size-border) solid var(--color-ui-border1);
    color: var(--color-text-primary);

    cursor: pointer;
  }

  .server-card:hover {
    transform: scale(1.01);
    /*box-shadow: -6px 6px 0 0 var(--color-ui-shadow);*/
  }

  .server-card-box.integrated {
    border: var(--ui-size-border) solid var(--color-ui-primary);
  }

  .server-info {
    flex: 1 1 auto;
    box-sizing: border-box;
    display: flex;
    height: 100%;
    padding-bottom: var(--ui-size-shadow);
    border-left: none;
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
  }

  .server-info > * {
    line-height: 1.2;
  }

  .description {
    position: relative;
    padding: 10px 10px 0 10px;
    flex: 1 0;
    min-width: 0;
  }

  .server-state-box {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    min-height: var(--ui-size-block);
    justify-content: space-between;
    user-select: none;

    /*background-color: var(--color-ui-primary);*/
    background-color: #444444;
    border: var(--ui-size-border) solid #333333;
    /*border: var(--ui-size-border) solid var(--color-ui-border);*/

    color: var(--color-text-secondary);
  }

  :global {
    .server-card-box {
      .rating {
        position: absolute;
        bottom: 0;
        height: var(--ui-size-block);
        align-items: center;

        >svg {
          justify-content: space-between;
        }
      }

      button.button.square.ui.interactive {
        background-color: transparent;
        color: var(--color-text-primary);
        border-color: transparent;
        box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;
        transition: border-color .15s ease;

        &:hover {
          border-color: #E5E5E5;
          box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;

          [href$="icon-star"] {
            opacity: 0;
          }

          [href$="icon-star-filled"] {
            opacity: 1;
          }
        }

        &:active {
          background-color: var(--color-ui-border1);
        }
      }
    }

    .server-state-box {
      padding: 0;

      .server-status {
        box-sizing: border-box;
        display: flex;
        justify-content: space-between;
        vertical-align: middle;

        padding: 5px;

        width: 100%;
        height: var(--ui-size-block);

        color: inherit;
      }

      .server-status > span {
        padding-right: 0;
      }
    }

    .server-status .icon {
      margin-right: 10px;
    }

    .slot.primary {
      color: var(--color-text-primary);
      font-family: "Minecraft", "Arial", "sans-serif";
    }

    .slot.alternate {
      color: var(--color-text-primary);
    }
  }
</style>