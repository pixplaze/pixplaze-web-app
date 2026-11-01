<script>
  import SvgSprite from "$ui/SvgSprite.svelte";

  let {
    icon,
    icons = [icon],
    frame,
    classes = [],
    size = 24
  } = $props();
</script>

  <SvgSprite path="/icons/sprite.svg"
             name={icon}
             names={icons}
             size="var(--ui-size-icon)"
             classes={[classes, 'icon']}
  />

<style>
</style>
