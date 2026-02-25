<script>
  let {
    icon,
    icons = [icon],
    classes = [],
    size = 24
  } = $props();
</script>

<svg aria-hidden="true"
     width={size}
     height={size}
     class={`icon ${classes}`}>
  {#each icons as icon}
    <use href={`/icons/sprite.svg#icon-${icon}`}/>
  {/each}
</svg>

<style>
  use {
    will-change: opacity, transform; /* Оптимизация отрисовки, увеличивает потребление памяти */
    opacity: 0;
  }
  use:first-child {
    opacity: 1;
  }
</style>