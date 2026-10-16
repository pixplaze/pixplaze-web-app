<script>
  import Rating from '$lib/components/Rating.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import MinecraftText from '$lib/components/ui/minecraft/MinecraftText.svelte';
  import {copyToClipboard, createDistinctDebounce} from '$lib/scripts/util/utils.js';
  import {formatNumber} from '$lib/scripts/util/utils.js';
  import {serversApi} from '$lib/scripts/api/servers.api.js';
  import {notifications} from '$lib/scripts/notifications.svelte.js';
  import Icon from "$lib/components/ui/Icon.svelte";

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

<div class="server-card">
  <div class="ui box server-card-box">
    <img src={server.image}
         alt="Server Icon"
         class="server-icon pixel-art">
    <div class="server-info">
      <div class="description">
        <h2>{server.name}</h2>
        <p>{server.host}</p>
<!--        <MinecraftText text={server.motd} classes="motd" trim={true}/>-->
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

  {#if server.state && server.core && server.core?.version && server.state.players}
    <div class="server-state-box">
      <div class="server-status">
        <span title="Онлайн" class="status-info online">
          <Icon icon="people"/>
          {#if server.state.players}
            {formatNumber(server.state.players.online)}/{formatNumber(server.state.players.max)}
          {/if}
        </span>
        <span title="Пинг" class="status-info ping">
          <Icon icon="ping"/>
          {server.state.ping}
        </span>
        <span title="Версия" class="status-info version">
          <Icon icon="version"/>
          {server.core?.version}
        </span>
        <span title="Язык" class="status-info language">
          <Icon icon="translate"/>
          {server.language}
        </span>
      </div>
      <div class="server-motd">
        <MinecraftText text={server.motd} classes="motd" trim={true}/>
      </div>
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
    box-shadow: 0 6px 0 0 var(--color-ui-shadow);
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

  .server-state-box {
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
    height: auto!important;
    min-height: var(--ui-size-block);
    justify-content: space-between;
    user-select: none;

    /*background-color: var(--color-ui-primary);*/
    background-color: #444444;
    border: var(--ui-size-border) solid #333333;
    /*border: var(--ui-size-border) solid var(--color-ui-border);*/
    box-shadow: 0 var(--ui-size-shadow) 0 0 var(--color-ui-shadow);
  }

  .server-status {
    display: grid;
    /* Одна колонка, пока рядом motd; одна на строке — колонок столько, сколько влезает */
    grid-template-columns: repeat(auto-fit, minmax(7em, 1fr));
    column-gap: var(--ui-spacing);
    flex-grow: 1;
    padding: 10px;
    padding-right: var(--ui-padding);
    margin-top: auto;
    margin-bottom: auto;
    user-select: none;
    /*border: var(--ui-size-border) solid #333333;*/
    /*margin: calc(-1 * var(--ui-size-border));*/
  }

  .status-info {
    text-wrap: nowrap;
    color: var(--color-text-secondary);
    font-family: "Minecraft", "Arial", "sans-serif";
    /*cursor: default;*/
  }

  .server-motd {
    box-sizing: border-box;
    display: flex;
    /* Забирает весь остаток строки, чтобы статус рядом с ним не растягивался */
    flex: 9999 0;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    min-width: 50%;
    border: var(--ui-size-border) solid #333333;
    margin: calc(-1 * var(--ui-size-border));
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

    .server-status {
      vertical-align: middle;
    }

    .server-status .icon {
      margin-right: 10px;
    }
  }
</style>