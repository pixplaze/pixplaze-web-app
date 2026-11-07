<script>
  import MinecraftText from "$ui/text/MinecraftText.svelte";

  let {
    motd
  } = $props();
</script>

<div class="server-motd">
  <MinecraftText text={motd} classes="motd" trim={true}/>
</div>

<style>
  .server-motd {
    box-sizing: border-box;
    display: flex;
    /* Забирает весь остаток строки, чтобы статус рядом с ним не растягивался */
    flex: 9999 0;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 10px;
    min-width: 50%;
    /* Тёмная карточка: текст MOTD без кода цвета — светлый */
    color: var(--color-text-secondary);
    border: var(--ui-size-border) solid #333333;
    margin: calc(-1 * var(--ui-size-border));
  }

  :global(.motd) {
    font-size: 12px;
  }
</style>