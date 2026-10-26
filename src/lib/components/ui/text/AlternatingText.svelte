<script>
  /**
   * Два содержимого на одном месте, сменяют друг друга раз в `interval` секунд с плавным переходом:
   * снипеты `primary` — основное (`.slot.primary`), `alternate` — сменяющее (`.slot.alternate`);
   * стили ячеек задаются снаружи через :global. Без `alternate` — только основное, без смены.
   * Занимает доступную ширину. Не влезающее в строку медленно прокручивается за время показа
   * (браузеры без контейнерных запросов — обрезка с многоточием). Отрисованные вместе сменяются вместе.
   * При «уменьшении движения» в системе — без смены и прокрутки: `alternate` под основным мелко.
   *
   * title — подсказка при наведении (снипеты в неё не превратить); шрифт и цвет — от родителя.
   */
  let {primary, alternate, interval = 4, title} = $props();
</script>

<span class="alternating" {title} style:--alternating-interval="{interval}s">
  <span class="slot primary" class:single={!alternate}>{@render primary()}</span>
  {#if alternate}
    <span class="slot alternate">{@render alternate()}</span>
  {/if}
</span>

<style>
  /* Окно на оба содержимых: они лежат в одной ячейке друг на друге, ширина — доступная, а не по
     содержимому; не влезающее обрезается здесь, а не в самих содержимых — те сдвигаются внутри */
  .alternating {
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    align-items: center;
    overflow: hidden;
  }

  /* Без контейнерных запросов: каждое — по ширине окна, не влезающее — с многоточием */
  .slot {
    grid-area: 1 / 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    animation: alternating-text calc(2 * var(--alternating-interval)) ease-in-out infinite;
  }

  .slot.single {
    animation: none;
  }

  /* Второе — в противофазе */
  .slot.alternate {
    opacity: 0;
    animation-delay: calc(-1 * var(--alternating-interval));
  }

  /* Половину цикла видно, половину — нет; переход — 5% цикла (0,4 с при 4 с) */
  @keyframes alternating-text {
    0%, 45%  { opacity: 1; }
    50%, 95% { opacity: 0; }
    100%     { opacity: 1; }
  }

  /* Прокрутка ровно на не влезающий хвост: 100% — ширина содержимого, 100cqw — ширина окна.
     Влезает — сдвиг min(0, …) = 0, стоит на месте. Цикл тот же, что у смены: пока видно — пауза
     в начале, прокрутка, пауза в конце; пока скрыто — возврат. Прозрачность и сдвиг — разные
     свойства, поэтому обе анимации идут на одном элементе списком. */
  @supports (container-type: inline-size) {
    .alternating {
      container-type: inline-size;
    }

    .slot {
      width: max-content;
      overflow: visible;
      text-overflow: clip;
      animation:
        alternating-text calc(2 * var(--alternating-interval)) ease-in-out infinite,
        alternating-marquee calc(2 * var(--alternating-interval)) linear infinite;
    }

    .slot.alternate {
      animation-delay: calc(-1 * var(--alternating-interval)), calc(-1 * var(--alternating-interval));
    }

    /* Одно содержимое не скрывается — возврат был бы виден рывком: туда и обратно с паузами */
    .slot.single {
      animation: alternating-marquee-single calc(2 * var(--alternating-interval)) linear infinite;
    }

    @keyframes alternating-marquee-single {
      0%, 15%  { transform: translateX(0); }
      50%, 65% { transform: translateX(min(0px, calc(100cqw - 100%))); }
      100%     { transform: translateX(0); }
    }

    @keyframes alternating-marquee {
      0%, 8%    { transform: translateX(0); }
      38%, 50%  { transform: translateX(min(0px, calc(100cqw - 100%))); }
      51%, 100% { transform: translateX(0); }
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .alternating {
      display: block;
    }

    /* Не слабее .slot.single, иначе одиночное продолжит прокручиваться */
    .alternating > .slot {
      display: block;
      width: auto;
      overflow: hidden;
      text-overflow: ellipsis;
      animation: none;
    }

    .alternating > .slot.alternate {
      font-size: .8em;
      opacity: .8;
    }
  }
</style>
