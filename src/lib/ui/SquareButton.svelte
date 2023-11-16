<script>
  import Button from "$lib/ui/Button.svelte";
  import Icon from "$lib/ui/Icon.svelte";

  export let icon;
  export let disabled = false;
  export let transparent = false;
</script>

<Button {disabled}
        {transparent}
        square
        on:click>
  <Icon {icon}/>
</Button>

<style>
  :global(button>span[class^="icon-"]::before) {
    font-size: 24px;
    color: var(--color-text-secondary) !important;
  }
</style>