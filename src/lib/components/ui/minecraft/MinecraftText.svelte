<!-- src/lib/components/MinecraftText.svelte -->
<script>
  import {parseMinecraftText} from '$lib/scripts/util/minecraft.util.js';

  // ampersand — понимать `&` как код (MOTD); в консоли и чате `&` — обычный символ
  let { text = '', trim = false, classes = '', ampersand = true } = $props();

  // Автоматический перерасчет токенов при изменении строки
  let tokens = $derived(parseMinecraftText(text, trim, {ampersand}));

  /**
   * Цвет токена. Без кода цвета (`null`) — не задаём: текст наследует `color` родителя. Явный `§f` —
   * `--mc-white`, если контейнер её задал (белый на светлом фоне не виден), иначе белый.
   */
  const colorStyle = color => {
    if (!color) return undefined;
    return `color: ${color === '#FFFFFF' ? 'var(--mc-white, #FFFFFF)' : color};`;
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
            style={colorStyle(token.color)}>
            {token.text}
        </span>
    {/each}
</span>

<style>
  /* Текст без кода цвета — цвета родителя. inherit явно: глобальное правило по элементам (global.css)
     красит каждый span в --color-text-primary и иначе обрывает наследование */
  .minecraft-container {
    color: inherit;
    display: inline-block;
    white-space: pre-wrap;
    line-height: 1.2;
  }

  .motd-token {
    color: inherit;
    display: inline;
    font-family: "Minecraft", "Arial", "sans-serif";
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
