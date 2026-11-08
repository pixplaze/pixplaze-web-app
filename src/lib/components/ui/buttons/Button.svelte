<script>
  let {
    title,
    disabled = false,
    classes = [],
    children,
    onclick,
    ...rest
  } = $props();
</script>

<button {title}
        type="button"
        {disabled}
        class={`ui interactive button ${classes}`}
        {onclick}
        {...rest}>
  {@render children()}
</button>

<style>
  button.button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  button.button {
    cursor: pointer;
    user-select: none;
    vertical-align: middle;
    color: var(--color-ui-button-text);
    border: var(--ui-size-border) solid var(--color-ui-button-border);
    background-color: var(--color-ui-button-background);
    box-shadow: inset 0 calc(-1 * var(--ui-size-shadow)) 0 0 var(--color-ui-button-shadow);
    transition: background-color .2s ease-out;
    padding-bottom: var(--ui-size-shadow);

    &:focus {
      outline-style: auto;
    }

    &:hover {
      background-color: var(--color-ui-button-hover-background);
    }

    &:active {
      background-color: var(--color-ui-button-active-background);
      border-color: var(--color-ui-button-active-border);
      box-shadow: none;
      padding-bottom: 0;
    }

    &:disabled {
      background-color: var(--color-ui-button-disabled-background);
      border-color: var(--color-ui-button-disabled-border);
      box-shadow: none;
      padding-bottom: 0;

      cursor: not-allowed;
    }

    &.square {
      width: var(--ui-size-block);
      padding-left: 0;
      padding-right: 0;
      /*margin: 0;*/
    }

    &.tiny {
      height: auto;
      margin: calc(-1 * var(--ui-size-border));
      align-self: stretch;
    }

    &.transparent {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      padding: 0;

      &:hover {
        background-color: var(--color-ui-button-hover-background);
      }

      &:active {
        background-color: var(--color-ui-button-active-background);
        border-color: var(--color-ui-button-active-border);
      }
    }
  }
</style>
