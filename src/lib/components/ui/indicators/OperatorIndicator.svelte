<script>
  import Icon from '$ui/Icon.svelte';

  let {
    classes = ''
  } = $props();
</script>

<Icon icon="operator" classes={`operator-indicator ${classes}`}/>

<style>
  /* Блик зачарованного предмета Minecraft, упрощённо: вместо бегущих полос — перелив оттенка
     #8040CC (цвет блика в игре) и свечение. Две волны за 3 с — как два слоя полос в игре. */
  :global {
    .operator-indicator {
      --effect-enchanted-wave: #502095;
      --effect-enchanted-flash: #8A5AD8;
      --effect-enchanted-glow: #8A5AD8AB;
      --effect-enchanted-ebb: #4A2280;
      animation: minecraft-enchanted 3s ease-in-out infinite;
    }

    /* Тёмная тема: текст белый. Те же оттенки и насыщенность, а светлота кадров отступает от цвета
       текста к чёрному на те же доли, на какие светлая тема отступает от #444444 к белому:
       12%, 45,5% и 7%. */
    .themed.dark .operator-indicator {
      --effect-enchanted-wave: #D6C2F2;
      --effect-enchanted-flash: #763DD1;
      --effect-enchanted-glow: #763DD1AB;
      --effect-enchanted-ebb: #E5D9F5;
    }

    @keyframes minecraft-enchanted {
      0%, 100% { color: var(--color-text-primary); }
      25%      { color: var(--effect-enchanted-wave); }
      50%      { color: var(--effect-enchanted-flash); filter: drop-shadow(0 0 4px var(--effect-enchanted-glow)); }
      75%      { color: var(--effect-enchanted-ebb); }
    }
  }
</style>
