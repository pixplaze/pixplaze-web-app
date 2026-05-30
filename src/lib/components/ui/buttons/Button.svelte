<script>
  let {
    disabled = false,
    classes = "",
    children,
    onclick,
  } = $props();
</script>

<button {disabled}
        type="button"
        class={`ui interactive button ${classes}`}
        {onclick}>
  {@render children()}
</button>

<style>
  .button {
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    color: var(--color-text-secondary);
    border-color: var(--color-ui-border);
    background-color: var(--color-ui-primary);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-secondary);
    transition: background-color .2s ease-out;

    &:hover {
      background-color: var(--color-ui-primary-lighter);
    }

    &:active {
      background-color: var(--color-ui-secondary);
      border-color: var(--color-ui-primary-lighter);
    }

    &:disabled {
      cursor: not-allowed;
      padding-bottom: 0;
      background-color: var(--color-main-dark);
      border-color: var(--color-ui-primary);
    }

    &.square {
      width: var(--ui-size-block);
      padding: 0;
      margin: 0;
    }

    &.transparent {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;

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
