<script>
  import {untrack} from 'svelte';
  import {classIf} from '$lib/scripts/util/utils.js';

  let {
    id,
    group = $bindable(),
    value,
    classes,
    children,
  } = $props();

  const radioId = untrack(() => `${id}-radio`);
  const checked = $derived(group === value);
</script>

<label for={radioId} class={`radio ${classIf(classes)}`} class:checked class:no-label={!children}>
  <span class="radio-point"></span>
  {@render children?.()}
  <input type="radio" id={radioId} class="hidden" bind:group value={value}>
</label>

<style>
  .radio {
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

  .radio.no-label {
    width: var(--ui-size-block);
  }

  .radio::before {
    content: "";
    display: inline-block;
    box-sizing: border-box;

    width: var(--ui-size-block);
    height: var(--ui-size-block);

    border: var(--ui-size-border) solid var(--color-ui-border);
    box-shadow: inset 4px 4px 0 0 var(--color-ui-shadow);
  }

  .radio:hover:not(.checked) > .radio-point {
    opacity: 50%;
  }

  .radio:not(.checked) > .radio-point {
    opacity: 0;
    pointer-events: none;
  }

  .radio-point {
    --point-size: calc(var(--ui-size-block) / 2);

    position: absolute;
    box-sizing: border-box;
    display: block;

    width: var(--point-size);
    height: var(--point-size);
    margin: calc((var(--ui-size-block) - var(--point-size)) / 2);

    background-color: var(--color-ui-primary);
    border: var(--ui-size-border) solid var(--color-ui-border);
    box-shadow: 4px 4px 0 0 var(--color-ui-shadow);

    transition: opacity .2s ease-out;
  }
</style>
