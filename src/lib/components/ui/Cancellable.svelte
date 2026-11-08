<script>
  const {
    time = '1s',
    children
  } = $props();
</script>

<div class="cancellable" style={`--duration: ${time};`}>
  {@render children()}
  <svg class="border-svg">
    <rect x="0" y="0" width="100%" height="100%" rx="0" ry="0" pathLength="1" />
  </svg>
</div>

<style>
  .cancellable {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    /*padding: 12px 24px;*/
    background: transparent; /* Цвет фона самого элемента */
    color: white;
    /*border-radius: 8px; !* Должно совпадать со скруглением SVG *!*/
    overflow: hidden;
  }

  /* Стилизация SVG-контейнера */
  .border-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none; /* Чтобы рамка не мешала кликам */
  }

  /* Стилизация самого прямоугольника обводки */
  .border-svg rect {
    fill: none;
    stroke: currentColor; /* Белый цвет обводки */
    stroke-width: 4px; /* Толщина линии (масштабируется) */

    /* Задаем длину штриха равной всему периметру (используем 400 для viewBox 100x100) */
    stroke-dasharray: 1;
    stroke-dashoffset: 1; /* Изначально полностью скрыта */

    /* Анимация с использованием CSS-переменной времени */
    animation: drawBorder var(--duration, 3s) linear forwards;
  }

  /* Ключевые кадры: уменьшаем offset до 0 для полного заполнения */
  @keyframes drawBorder {
    to {
      stroke-dashoffset: 0;
    }
  }

</style>