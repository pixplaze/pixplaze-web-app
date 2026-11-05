<script>
  import {formatNumber} from '$util/format.util.js';
  import Icon from "$ui/Icon.svelte";

  /**
   * Онлайн, пинг и версия сервера одной строкой; не помещаются — переносятся, значения не обрезаются.
   * max — показывать ли максимум игроков рядом с онлайном (`14/50`); в плитке листинга — только онлайн.
   * Языка нет: API его не отдаёт, а зашитое «RU» выдавало значение по умолчанию за данные.
   */
  let {
    core,
    state,
    max = true,
    classes = ''
  } = $props();
</script>

<div class="server-status {classes}">
  {#if state?.players}
    <span title="Онлайн" class="status-info online">
      <Icon icon="people"/>
      {formatNumber(state.players.online)}{#if max}/{formatNumber(state.players.max)}{/if}
    </span>
  {/if}
  {#if state?.ping}
    <span title="Пинг, мс" class="status-info ping">
      <Icon icon="ping"/>{state.ping}
    </span>
  {/if}
  {#if core}
    <span title="Версия" class="status-info version">
      <Icon icon="version"/>{core?.version ?? 'multi'}
    </span>
  {/if}
</div>

<style>
  .server-status {
    display: flex;
    flex-wrap: wrap;
    gap: 2px 12px;

    padding-top: var(--padding);
  }

  span {
    display: flex;
    align-items: center;
    gap: 2px;

    flex: 0 0 max-content;
    text-wrap: nowrap;

    font-family: var(--font-ui);
    color: inherit;

    :global(.icon) {
      flex-shrink: 0;
    }
  }
</style>
