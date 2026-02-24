<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    icon,
    disabled,
    classes = "",
    onclick
  } = $props();
</script>

<Button {disabled}
        classes={`${classes} square`}
        {onclick}
>
  <Icon {icon}/>
</Button>

<style>
  :global(button>span[class^="icon-"]::before) {
    font-size: 24px;
    color: var(--color-text-secondary) !important;
  }
</style>