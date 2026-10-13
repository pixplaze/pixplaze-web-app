<script>
  import Rating from '$lib/components/Rating.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import MinecraftText from '$lib/components/ui/minecraft/MinecraftText.svelte';
  import {copyToClipboard, createDistinctDebounce} from '$lib/scripts/util/utils.js';
  import {formatNumber} from '$lib/scripts/util/utils.js';
  import {serversApi} from '$lib/scripts/api/servers.api.js';
  import {notifications} from '$lib/scripts/notifications.svelte.js';

  /**
   * favorite — сервер в избранном; null — избранное недоступно (гость), звезда скрыта.
   * onFavorite — клик по звезде; что делать, решает владелец карточки.
   */
  let {
    server,
    favorite = null,
    onFavorite
  } = $props();

  let copied = $state(false);

  const onCopy = async () => {
    await copyToClipboard(server.host);
    copied = true;
    setTimeout(() => copied = false, 1500);
  };

  const rateServer = createDistinctDebounce((rating) => serversApi.rate(server.id, rating), 1000);

  const onVoted = (rating) => {
    rateServer.run(rating).catch((e) => {
      if (e.name !== 'AbortError') {
        notifications.error('Не удалось сохранить оценку');
      }
    });
  };

  </script>

<div class="server-card-wrapper">
  <div class="ui box server-card">
    <img src={server.image}
         alt="Server Icon"
         class="server-icon pixel-art">
    <div class="server-info">
      <div class="description">
        <h2>{server.name}</h2>
        <p>{server.host}</p>
        <MinecraftText text={server.motd} classes="motd" trim={true}/>
        <Rating value={server.rating} {onVoted}/>
      </div>
      <div class="buttons">
        <ButtonIcon icon="more" classes="transparent"/>
        <ButtonIcon icon={copied ? 'arrow-ok' : 'copy'} classes="transparent {copied ? 'copied' : ''}" onclick={onCopy}/>
        {#if favorite !== null}
          <ButtonIcon icons={favorite ? ['star-filled'] : ['star', 'star-filled']}
                      classes="transparent" onclick={() => onFavorite?.(server)}/>
        {/if}
      </div>
    </div>
  </div>

  {#if server.state || server.core || server.core?.version || server.state.players}
<!--    <div class="server-state"-->
<!--         style="height: auto!important;-->
<!--                min-height: var(&#45;&#45;ui-size-block);-->
<!--                padding: 10px;-->
<!--                background-color: #444444;-->
<!--                justify-content: center;-->
<!--                text-align: center;-->
<!--                border: var(&#45;&#45;ui-size-border) solid #333333;"-->
<!--    >-->
<!--      <MinecraftText text={server.motd} classes="motd" trim={true}/>-->
<!--    </div>-->
    <div class="server-state">
      <span class="state-info version">
        {server.core?.version}
      </span>
      <span class="state-info online">
        {#if server.state.players}
          {formatNumber(server.state.players.online)}/{formatNumber(server.state.players.max)}
        {/if}
      </span>
    </div>
  {/if}
</div>
<style>
  .ui.box {
    box-sizing: border-box;
    overflow: hidden;
  }

  .server-card {
    display: flex;
    flex-direction: row;
    box-sizing: border-box;
    overflow: hidden;
    min-width: 256px;
    height: 128px;
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  .server-icon {
    flex: 0 0 128px;
    box-sizing: border-box;
    border: var(--ui-size-border) solid var(--color-ui-primary);
    box-shadow: inset 0 -4px 0 0 var(--color-ui-shadow);
  }

  .server-info {
    flex: 1 1 auto;
    box-sizing: border-box;
    display: flex;
    height: 100%;
    padding-bottom: var(--ui-size-shadow);
    border: var(--ui-size-border) solid var(--color-ui-border1);
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
    /*max-width: 100px;*/
  }

  .server-state {
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: var(--ui-size-block);

    margin-top: 10px;
    padding-left: 10px;
    padding-right: 10px;

    background-color: var(--color-ui-primary);
    border: var(--ui-size-border) solid var(--color-ui-border);
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  .state-info {
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
  }

  :global {
    .server-card {
      .rating {
        position: absolute;
        bottom: 0;
        height: var(--ui-size-block);
        align-items: center;

        >svg {
          justify-content: space-between;
        }
      }

      .motd {
        font-size: 12px;
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
  }
</style>