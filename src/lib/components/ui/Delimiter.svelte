<script>
  const { value, classes } = $props();
</script>

<div class={`delimiter ${classes}`}
     role="separator"
     class:text={value}
     aria-orientation="horizontal"
     aria-label={value ? undefined : 'Разделитель'}>
  {#if value}{value}{/if}
</div>

<style>
  .delimiter {
    display: flex;
    align-items: center;
    width: 100%;
    text-align: center;

    font-family: "Minecraft", "Arial", "sans-serif";
  }

  .text {
    gap: var(--ui-padding);
    overflow-wrap: anywhere;
  }

  .delimiter::before,
  .delimiter::after {
    content: '';
    flex: 1;
    height: var(--ui-size-border);
    background-color: var(--color-ui-border);
    /*min-width: calc(2 * var(--ui-size-block));*/
    min-width: max(calc(2 * var(--ui-size-block)), 25%); /* текст ≤ ~50% контейнера */
    will-change: transform;
    contain: strict;
  }
</style>
