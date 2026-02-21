<script>
  let {icon} = $props();
</script>

<div class={`icon-${icon}`}></div>

<style>
  div[class*="icon-"] {
    display: inline-block;

    font-size: var(--ui-size-icon);
    width: var(--ui-size-icon);
    height: var(--ui-size-icon);
  }
</style>