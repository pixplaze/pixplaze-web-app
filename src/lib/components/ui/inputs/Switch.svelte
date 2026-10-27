<script>
  import {untrack} from 'svelte';
  import {classIf} from '$util/dom.util.js';

  /**
   * Переключатель вкл/выкл: дорожка с ползунком. Устроен как {@link Checkbox} — скрытый нативный
   * checkbox с role="switch" (клавиатура, фокус и скринридер — от браузера), подпись слева.
   */
  let {
    id,
    checked = $bindable(false),
    classes,
    children,
  } = $props();

  const switchId = untrack(() => `${id}-switch`);
</script>

<label for={switchId} class={`switch focusable ${classIf(classes)}`} class:checked class:no-label={!children}>
  <span class="switch-thumb"></span>
  {@render children?.()}
  <input type="checkbox" role="switch" id={switchId} class="hidden" bind:checked>
</label>

<style>
  .switch {
    --switch-width: calc(2 * var(--ui-size-block));

    display: inline-flex;
    box-sizing: border-box;
    position: relative;

    align-items: center;
    flex-direction: row-reverse;
    justify-content: space-between;

    width: 100%;
    height: 100%;

    cursor: pointer;
    user-select: none;
    -webkit-user-drag: none;
  }

  .switch.no-label {
    width: var(--switch-width);
  }

  /* Дорожка */
  .switch::before {
    content: "";
    display: inline-block;
    box-sizing: border-box;
    min-width: var(--switch-width);
    width: var(--switch-width);
    height: var(--ui-size-block);

    border: var(--ui-size-border) solid var(--color-ui-border);
    box-shadow: inset 4px 4px 0 0 var(--color-ui-shadow);
    transition: background-color .2s ease-out;
  }

  .switch.checked::before {
    background-color: var(--color-ui-primary);
  }

  .switch.checked:hover::before {
    background-color: var(--color-ui-primary-lighter);
  }

  /* Ползунок: блок-кнопка в левой половине дорожки, включённый — в правой */
  .switch-thumb {
    position: absolute;
    top: 0;
    right: var(--ui-size-block);
    box-sizing: border-box;
    width: var(--ui-size-block);
    height: var(--ui-size-block);

    border: var(--ui-size-border) solid var(--color-ui-border);
    background-color: var(--color-ui-foreground);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
    pointer-events: none;
    transition: transform .2s ease-out;
  }

  .switch.checked > .switch-thumb {
    transform: translateX(var(--ui-size-block));
  }

  .switch:active > .switch-thumb {
    box-shadow: none;
  }

  @media (prefers-reduced-motion: reduce) {
    .switch::before,
    .switch-thumb {
      transition: none;
    }
  }
</style>
