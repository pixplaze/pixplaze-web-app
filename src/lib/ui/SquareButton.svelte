<script>
  import Button from "$lib/ui/Button.svelte";
  export let icon;
  export let disabled = false;
  export let transparent = false;
</script>

<Button {disabled}
        {transparent}
        square
        on:click>
  <span class={`icon-${icon}`}>{icon}</span>
</Button>

<style>
  span {
    font-size: 0;
  }

  span[class^="icon-"]::before {
    font-size: 24px;
    color: var(--color-text-secondary);
  }
</style>