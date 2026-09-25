<script>
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    id,
    checked = $bindable(false),
    classes,
    children,
  } = $props();
</script>

<label for={`${id}-checkbox`} class={`checkbox ${classes}`} class:checked class:no-label={!children}>
  <Icon icon="arrow-ok"/>
  {@render children?.()}
  <input type="checkbox" id={`${id}-checkbox`} class="hidden" bind:checked>
</label>

<style>
  .checkbox {
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

  .checkbox.no-label {
    width: var(--ui-size-block);
  }

  .checkbox {
    &::before {
      content: "";
      display: inline-block;
      box-sizing: border-box;
      min-width: var(--ui-size-block);
      width: var(--ui-size-block);
      height: var(--ui-size-block);

      border: var(--ui-size-border) solid var(--color-ui-border);
      box-shadow: inset 4px 4px 0 0 var(--color-ui-shadow);
      transition: background-color .2s ease-out;
    }

    &:active::before {
      background-color: var(--color-ui-secondary);
      border-color: var(--color-ui-primary-lighter);
      box-shadow: none;
    }
  }

  .checkbox.checked {
    &::before {
      color: var(--color-text-secondary);
      background-color: var(--color-ui-primary);
      box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
    }
    &:hover::before {
      background-color: var(--color-ui-primary-lighter);
    }
    &:active::before {
      background-color: var(--color-ui-secondary);
      border-color: var(--color-ui-primary-lighter);
      box-shadow: none;
    }
  }

  :global {
    .checkbox>.icon {
      position: absolute;
      padding: calc((var(--ui-size-block) - var(--ui-size-icon)) / 2);
      color: var(--color-text-secondary);
      pointer-events: none;
      opacity: 0;
    }

    .checkbox.checked>.icon,
    .checkbox:active>.icon {
      opacity: 1;
    }
  }
</style>