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
  button {
    cursor: pointer;
    user-select: none;
    -webkit-user-drag: none;

    vertical-align: middle;

    color: var(--color-text-secondary);
    background-color: var(--color-ui-primary);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-secondary);

    transition: background-color .2s ease-out;
  }

  button:hover {
    background-color: var(--color-ui-primary-lighter);
  }

  button:active {
    background-color: var(--color-ui-secondary);
    border: var(--ui-size-border) solid var(--color-ui-primary-lighter);
  }

  button:disabled {
    cursor: not-allowed;
    padding-bottom: 0;
    background-color: var(--color-main-dark);
    border: var(--ui-size-border) solid var(--color-ui-primary);
  }

  button.square {
    width: var(--ui-size-block);
    padding: 0;
    margin: 0;
  }

  button.transparent {
    background-color: transparent;
    border-color: transparent;
    box-shadow: none;
  }

  button.transparent:hover {
    background-color: var(--color-ui-primary-lighter)!important;
  }

  button.transparent:active {
    background-color: var(--color-ui-secondary)!important;
    border-color: var(--color-ui-primary-lighter)!important;
  }
</style>
