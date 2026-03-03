<script>
  import ButtonIcon from "$lib/components/ui/buttons/ButtonIcon.svelte";
  import Button from "$lib/components/ui/buttons/Button.svelte";

  const {
    name,
    thumbnail = 'data:image/png;base64,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'
  } = $props();
</script>
<div class="server-row">
  <Button classes="transparent server-info">
    <img src={thumbnail} alt="" class="pixel-art server-icon">
    {name}
  </Button>
  <div class="server-buttons">
    <ButtonIcon classes="transparent" icon="more"/>
    <ButtonIcon classes="transparent" icon="copy"/>
    <ButtonIcon classes="transparent" icon="star-filled"/>
  </div>
</div>

<style>
  .server-row {
    display: flex;
    flex-direction: row;
  }
  .server-row:hover {
    background-color: var(--color-ui-primary);
  }
  .server-row>* {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .server-icon {
    border-right: var(--ui-size-border) solid transparent;

    width: var(--ui-size-block);
    height: var(--ui-size-block);
    margin-right: var(--ui-padding);
  }

  :global {
    .server-row button.ui.interactive.transparent.server-info {
      display: flex;
      align-items: center;

      padding: 0;
      background-color: transparent;
      color: var(--color-text-secondary);
    }
  }
</style>
