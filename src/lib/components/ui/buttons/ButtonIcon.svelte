<script>
  import Button from '$ui/buttons/Button.svelte';
  import Icon from '$ui/Icon.svelte';

  let {
    icon,
    icons,
    classes = [],
    children,
    ...rest
  } = $props();
</script>

<Button classes={`${classes} ${children? '' : 'square'} icon`}
        {...rest}>
  {@render children?.()}
  <Icon {icon} {icons}/>
</Button>

<style>
  :global {
    .button svg {
      min-width: var(--ui-size-icon);
    }

    .button use {
      transition: opacity .1s ease-in;
    }
  }
</style>