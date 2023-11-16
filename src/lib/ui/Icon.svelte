<script>
  export let icon;
</script>

<span class={`icon-${icon}`}>icon</span>

<style>
  span {
    font-size: 0;
  }

  span[class^="icon-"]::before {
    font-size: 24px;
    /*color: var(--color-text-primary);*/
  }
</style>