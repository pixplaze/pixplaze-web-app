<script>
  let {
    path,
    name,
    names=[name],
    frame,
    classes = [],
    size = 'var(--ui-size-block)',
    width = size,
    height = size
  } = $props();
</script>

<svg aria-hidden="true"
     viewBox={frame}
     width={width}
     height={height}
     class={classes}>
  {#each names as name}
    <use href={`${path}#${name}`}/>
  {/each}
</svg>

<style>
  use {
    shape-rendering: optimizeSpeed;
    will-change: opacity, transform; /* Оптимизация отрисовки, увеличивает потребление памяти */
    opacity: 0;
  }
  use:first-child {
    opacity: 1;
  }
</style>
