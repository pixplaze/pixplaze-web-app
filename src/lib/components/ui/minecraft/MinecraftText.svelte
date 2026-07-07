<!-- src/lib/components/MinecraftText.svelte -->
<script>
  import {parseMinecraftText} from '$lib/scripts/util/minecraft.util.js';

  // Принимаем props в стиле Svelte 5 JS
  let { text = '', trim = false, classes = '' } = $props();

  // Автоматический перерасчет токенов при изменении строки
  let tokens = $derived(parseMinecraftText(text, trim));
  const parseColorStyle = color => {
    if (color === '#FFFFFF') {
      return 'var(--color-text-primary)';
    }

    return color;
  }
</script>

<span class="minecraft-container {classes}">
    {#each tokens as token}
        <span class="motd-token {classes}"
            class:bold={token.bold}
            class:italic={token.italic}
            class:underline={token.underline}
            class:strikethrough={token.strikethrough}
            class:obfuscated={token.obfuscated}
            style="color: {parseColorStyle(token.color)};">
            {token.text}
        </span>
    {/each}
</span>

<style>
  .minecraft-container {
    display: inline-block;
    white-space: pre-wrap;
    line-height: 1.2;
  }

  .motd-token {
    display: inline;
    font-family: "Minecraft", "Arial", "sans-serif";
    color: var(--color-text-primary);
  }

  .bold { font-weight: bold; }
  .italic { font-style: italic; }
  .underline { text-decoration: underline; }
  .strikethrough { text-decoration: line-through; }
  .underline.strikethrough { text-decoration: underline line-through; }

  .obfuscated {
    animation: mc-magic 0.15s infinite alternate;
    user-select: none;
  }

  @keyframes mc-magic {
    0% { filter: blur(0px); opacity: 1; }
    100% { filter: blur(1px); opacity: 0.7; }
  }
</style>
