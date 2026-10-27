<script>
  import Button from "$ui/buttons/Button.svelte";
  import Icon from "$ui/Icon.svelte";

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