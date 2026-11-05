<script>
  import {pointerHint} from '$scripts/pointerHint.svelte.js';
</script>

<!-- aria-live: скринридер объявит текст, хотя фокус остаётся на кнопке -->
<div class="pointer-hint-host" aria-live="polite">
  {#if pointerHint.text}
    {#key pointerHint.key}
      <div class="pointer-hint" style:left="{pointerHint.x}px" style:top="{pointerHint.y}px">
        {pointerHint.text}
      </div>
    {/key}
  {/if}
</div>

<style>
  .pointer-hint-host {
    position: fixed;
    inset: 0;
    z-index: 10;
    pointer-events: none;
  }

  /* Над курсором и чуть правее, чтобы не закрывать нажатую кнопку */
  .pointer-hint {
    position: absolute;
    transform: translate(12px, calc(-100% - 8px));
    padding: 4px 8px;
    white-space: nowrap;

    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-birch);
    background-color: var(--color-coal);
    border-radius: var(--ui-radius);
    box-shadow: 2px 2px 0 0 var(--color-outline-shadow-hover);

    animation: pointer-hint .12s ease-out;
  }

  @keyframes pointer-hint {
    from {
      opacity: 0;
      transform: translate(12px, calc(-100% - 2px));
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .pointer-hint {
      animation: none;
    }
  }
</style>
