<script>
  let {
    icon,
    size = 24
  } = $props();
</script>

<svg
  width={size}
  height={size}
  class={`icon-${icon}`}
  aria-hidden="true"
>
  <use href={`/icons/sprite.svg#icon-${icon}`}/>
</svg>

<style>
  svg {
    vertical-align: middle;
  }
</style>