<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    icon,
    icons,
    classes = '',
    onclick,
    ...rest
  } = $props();
</script>

<Button classes={`${classes} square`} {onclick} {...rest}>
  <Icon {icon} {icons}/>
</Button>

<style>
  :global {
    .button use {
      transition: opacity .1s ease-in;
    }
  }
</style>