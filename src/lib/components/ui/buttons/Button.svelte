<script>
  let {
    title,
    disabled = false,
    classes = "",
    children,
    onclick,
  } = $props();
</script>

<button {title}
        type="button"
        {disabled}
        class={`ui interactive button ${classes}`}
        {onclick}>
  {@render children()}
</button>

<style>
  button.button {
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    color: var(--color-text-secondary);
    border: var(--ui-size-border) solid var(--color-ui-border);
    background-color: var(--color-ui-primary);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-shadow);
    transition: background-color .2s ease-out;
    padding-bottom: var(--ui-size-shadow);

    &:hover {
      background-color: var(--color-ui-primary-lighter);
    }

    &:active {
      background-color: var(--color-ui-secondary);
      border-color: var(--color-ui-primary-lighter);
      box-shadow: none;
      padding-bottom: 0;
    }

    &:disabled {
      cursor: not-allowed;
      padding-bottom: 0;
      background-color: var(--color-main-dark);
      border-color: var(--color-ui-primary);
      box-shadow: none;
    }

    &.square {
      width: var(--ui-size-block);
      padding-left: 0;
      padding-right: 0;
      margin: 0;
    }

    &.transparent {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      padding: 0;

      &:hover {
        background-color: var(--color-ui-primary-lighter);
      }

      &:active {
        background-color: var(--color-ui-secondary);
        border-color: var(--color-ui-primary-lighter);
      }
    }
  }
</style>
