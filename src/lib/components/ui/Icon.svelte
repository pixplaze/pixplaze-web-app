<script>
  let {
    icon,
    icons = [icon],
    frame,
    classes = [],
    size = 24
  } = $props();
</script>

<svg aria-hidden="true"
     viewBox={frame}
     class={`icon ${classes}`}>
  {#each icons as icon}
    <use href={`/icons/sprite.svg#icon-${icon}`}/>
  {/each}
</svg>

<style>
  svg {
    width: var(--icon-size, var(--ui-size-icon));
    height: var(--icon-size, var(--ui-size-icon));
  }
  use {
    shape-rendering: optimizeSpeed;
    will-change: opacity, transform; /* Оптимизация отрисовки, увеличивает потребление памяти */
    opacity: 0;
  }
  use:first-child {
    opacity: 1;
  }
</style>