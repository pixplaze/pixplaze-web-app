<script>
  import {formatNumber} from '$util/format.util.js';
  import Icon from "$ui/Icon.svelte";

  let {
    core,
    state,
    classes
  } = $props();
</script>

<div class="server-status">
  {#if state.players}
    <span title="Онлайн" class="status-info online">
      <Icon icon="people" size="24px"/>
      {formatNumber(state.players.online)}/{formatNumber(state.players.max)}
    </span>
  {/if}
  {#if state.ping}
    <span title="Пинг" class="status-info ping">
      <Icon icon="ping"/>{state.ping}
    </span>
  {/if}
  {#if core}
    <span title="Версия" class="status-info version">
      <Icon icon="version"/>{core?.version ?? 'multi'}
    </span>
  {/if}
  <span title="Язык" class="status-info language">
    <Icon icon="translate"/>RU
  </span>
</div>

<style>
  .server-status {
    /*display: grid;*/
    /*grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));*/
    display: flex;
    flex-wrap: wrap;

    padding-top: var(--padding);
  }

  span {
    display: flex;
    padding-right: 10px;
    align-items: center;

    flex-grow: 0;
    flex-shrink: 0;
    flex-basis: max-content;

    text-wrap: nowrap;

    font-family: "Minecraft", "Montserrat", "sans-serif";
    color: inherit;

    :global(.icon) {
      flex-shrink: 0;
    }
  }
</style>