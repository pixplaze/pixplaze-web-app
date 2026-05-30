<script>
  import Button from "$lib/components/ui/buttons/Button.svelte";
  import Icon from "$lib/components/ui/Icon.svelte";

  let {
    icon,
    disabled = false,
    square = false,
    transparent = false,
    children,
    onclick
  } = $props();
</script>

<Button {disabled}
        {transparent}
        {square}
        {onclick}>
  {@render children()}
  <Icon {icon}/>
</Button>