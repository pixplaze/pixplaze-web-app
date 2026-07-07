<script>
  import Rating from '$lib/components/Rating.svelte';
  import ButtonIcon from '$lib/components/ui/buttons/ButtonIcon.svelte';
  import MinecraftText from '$lib/components/ui/minecraft/MinecraftText.svelte';
  import {formatNumber} from '$lib/scripts/util/utils.js';
  import {createDistinctDebounce} from '$lib/scripts/util/utils.js';
  import {api} from '$lib/scripts/api/api.config.js';

  let {
    server
  } = $props();

  const copyAddressToClipboard = async () => {
    await navigator.clipboard.writeText(server.host);
  };

  const rateServer = createDistinctDebounce((rating) => {
    console.log(server);
    api.post(`/servers/rate/${server.id}?rating=${rating}`);
  }, 1000);

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
        <Rating value={server.rating} onVoted={(rating) => rateServer.run(rating)}/>
      </div>
      <div class="buttons">
        <ButtonIcon icon="more"/>
        <ButtonIcon icon="copy" onclick={copyAddressToClipboard}/>
        <ButtonIcon icons={["star", "star-filled"]}/>
      </div>
    </div>
  </div>

  {#if server.state || server.core || server.core?.version || server.state.players}
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

      button.ui.interactive {
        background-color: transparent;
        color: var(--color-text-primary);
        border-color: transparent;
        box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 transparent;

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