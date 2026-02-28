<script>
  let {
    icon,
    icons = [icon],
    classes = [],
    size = 24
  } = $props();
</script>

<svg aria-hidden="true"
     class={`icon ${classes}`}>
  {#each icons as icon}
    <use href={`/icons/sprite.svg#icon-${icon}`}/>
  {/each}
</svg>

<style>
  svg {
    width: var(--ui-size-icon);
    height: var(--ui-size-icon);
  }
  use {
    will-change: opacity, transform; /* Оптимизация отрисовки, увеличивает потребление памяти */
    opacity: 0;
  }
  use:first-child {
    opacity: 1;
  }
</style>