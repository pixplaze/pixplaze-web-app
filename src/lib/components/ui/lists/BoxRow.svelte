<script>
  const {
    classes,
    children
  } = $props();
</script>

<div class="box-row {classes}">
  {@render children()}
</div>

<style>
  .box-row {
    box-sizing: border-box;
    width: 100%;
    height: var(--ui-size-block);
    padding-left: var(--ui-padding);
    padding-right: var(--ui-padding);

    align-content: center;

    border: var(--ui-size-border) solid transparent;
  }

  :global(.box-row > *) {
    box-sizing: border-box;
    display: block;
  }
</style>