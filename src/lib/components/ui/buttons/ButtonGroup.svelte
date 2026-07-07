<script>
  const {
    classes,
    children
  } = $props();
</script>

<div class={`button-group ${classes}`}>
  {@render children()}
</div>

<style>
  .button-group {
    display: flex;
    flex-direction: row;
  }

  :global {
    .button-group > button.ui.interactive.button {
      margin-left: calc(-1 * var(--ui-size-border));
      margin-right: calc(-1 * var(--ui-size-border));
    }
    .button-group > button.ui.interactive.button:first-child {
      margin-left: 0;
    }
    .button-group > button.ui.interactive.button:first-child {
      margin-right: 0;
    }
  }
</style>