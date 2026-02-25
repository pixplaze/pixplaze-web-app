<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    icon,
    icons,
    disabled,
    classes = "",
    onclick
  } = $props();
</script>

<Button {disabled}
        classes={`${classes} square`}
        {onclick}>
  <Icon {icon} {icons}/>
</Button>

<style>
  :global(.button use) {
    transition: opacity .1s ease-in;
  }
</style>