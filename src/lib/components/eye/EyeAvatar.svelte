<script>
  import {parseImageBase64} from '$util/image.util.js';
  import {nameHue, relativeTime} from '$components/eye/eyeFormat.js';

  /**
   * Аватар игрока: голова скина (нет — первая буква ника на цветном блоке) и точка статуса в углу:
   * зелёная — в игре, серая — нет. Статус дублируется скрытым текстом для скринридеров.
   * size — сторона в px.
   */
  let {player, size = 32} = $props();

  const status = $derived(player.online ? 'в игре' : `не в игре, был ${relativeTime(player.lastSeen)}`);
</script>

<span class="avatar" style:--size="{size}px" style:--hue={nameHue(player.name)} title={status}>
  {#if player.skinHeadBase64}
    <img src={parseImageBase64(player.skinHeadBase64)} alt="" class="pixel-art">
  {:else}
    <span class="letter" aria-hidden="true">{player.name[0]}</span>
  {/if}
  <span class="dot" class:online={player.online} aria-hidden="true"></span>
  <span class="hidden">{status}</span>
</span>

<style>
  .avatar {
    position: relative;
    display: inline-grid;
    flex: 0 0 var(--size);
    width: var(--size);
    height: var(--size);
  }

  img,
  .letter {
    width: 100%;
    height: 100%;
    border-radius: var(--ui-radius);
  }

  img {
    image-rendering: pixelated;
  }

  .letter {
    display: grid;
    place-items: center;
    font-family: var(--font-ui);
    font-size: calc(var(--size) * .55);
    color: #FFFDF7;
    background-color: hsl(var(--hue) 35% 42%);
  }

  /* Точка статуса — с кольцом цвета подложки, чтобы отделялась от головы */
  .dot {
    position: absolute;
    right: calc(var(--size) * -.12);
    bottom: calc(var(--size) * -.12);
    width: max(10px, calc(var(--size) * .28));
    height: max(10px, calc(var(--size) * .28));
    background-color: var(--color-stone-light);
    border: 2px solid var(--color-birch);
    border-radius: 50%;

    &.online {
      background-color: #4CAF50;
    }
  }
</style>
