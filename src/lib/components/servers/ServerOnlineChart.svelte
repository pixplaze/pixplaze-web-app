<script>
  /**
   * Онлайн сервера за неделю по часам: область и линия по пику часа, часы офлайна — штриховкой
   * (не только цветом). Наведение — перекрестие и подсказка с пиком и средним за час.
   * points — {hour: Date, peak, average, max, online}[] по возрастанию часа; пропущенные часы считаются
   * «нет данных» и рвут линию.
   */
  let {points} = $props();

  const HOUR = 3_600_000;
  const PAD = {top: 12, right: 8, bottom: 24, left: 36};
  const HEIGHT = 180;

  let width = $state(600);
  let hoverIndex = $state(null);

  // Непрерывная шкала часов: от первого до последнего, без дыр — пропуски станут null
  const series = $derived.by(() => {
    if (!points.length) return [];
    const byHour = new Map(points.map(p => [p.hour.getTime(), p]));
    const first = points[0].hour.getTime();
    const last = points[points.length - 1].hour.getTime();
    const out = [];
    for (let t = first; t <= last; t += HOUR) {
      out.push(byHour.get(t) ?? {hour: new Date(t), peak: null, average: null, max: null, online: null});
    }
    return out;
  });

  const peakMax = $derived(Math.max(1, ...series.map(p => p.peak ?? 0)));
  // Верх шкалы — «круглое» число над пиком, чтобы подписи сетки читались
  const yTop = $derived.by(() => {
    const step = 10 ** Math.floor(Math.log10(peakMax));
    return Math.ceil(peakMax / step) * step;
  });
  const plotW = $derived(Math.max(1, width - PAD.left - PAD.right));
  const plotH = HEIGHT - PAD.top - PAD.bottom;
  const x = (i) => PAD.left + (series.length > 1 ? i / (series.length - 1) : 0) * plotW;
  const y = (v) => PAD.top + plotH - (v / yTop) * plotH;

  /** Отрезки подряд идущих часов с данными в сети — линия и область рвутся на офлайне и пропусках. */
  const segments = $derived.by(() => {
    const result = [];
    let current = [];
    series.forEach((p, i) => {
      if (p.online && p.peak != null) {
        current.push(i);
      } else if (current.length) {
        result.push(current);
        current = [];
      }
    });
    if (current.length) result.push(current);
    return result;
  });

  const linePath = (seg) => seg.map((i, k) => `${k ? 'L' : 'M'}${x(i)},${y(series[i].peak)}`).join('');
  const areaPath = (seg) => `${linePath(seg)}L${x(seg.at(-1))},${y(0)}L${x(seg[0])},${y(0)}Z`;

  /** Офлайн-часы — прямоугольники штриховки; соседние сливаются. */
  const offlineRuns = $derived.by(() => {
    const runs = [];
    let start = null;
    series.forEach((p, i) => {
      if (p.online === false && start === null) start = i;
      if (p.online !== false && start !== null) {
        runs.push([start, i - 1]);
        start = null;
      }
    });
    if (start !== null) runs.push([start, series.length - 1]);
    return runs;
  });

  const halfStep = $derived(series.length > 1 ? plotW / (series.length - 1) / 2 : 0);

  /** Начало каждых суток (по местному времени) — подписи оси X. */
  const dayTicks = $derived(series
      .map((p, i) => ({i, d: p.hour}))
      .filter(({d}) => d.getHours() === 0)
      .map(({i, d}) => ({i, label: d.toLocaleDateString(undefined, {weekday: 'short'})})));

  const gridValues = $derived(Number.isInteger(yTop / 2) ? [0, yTop / 2, yTop] : [0, yTop]);

  const stats = $derived.by(() => {
    const online = series.filter(p => p.online && p.peak != null);
    if (!online.length) return null;
    const top = online.reduce((a, b) => (b.peak > a.peak ? b : a));
    const average = Math.round(online.reduce((sum, p) => sum + p.average, 0) / online.length);
    const uptime = Math.round(online.length / series.filter(p => p.online != null).length * 100);
    return {top, average, uptime};
  });

  const hovered = $derived(hoverIndex != null ? series[hoverIndex] : null);

  const onMove = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const px = event.clientX - rect.left;
    const i = Math.round((px - PAD.left) / plotW * (series.length - 1));
    hoverIndex = Math.min(series.length - 1, Math.max(0, i));
  };

  const formatHour = (d) => d.toLocaleString(undefined, {weekday: 'short', hour: '2-digit', minute: '2-digit'});

  /** Итоги по дням — для скринридеров вместо графика. */
  const daily = $derived.by(() => {
    const days = new Map();
    for (const p of series) {
      const key = p.hour.toLocaleDateString(undefined, {weekday: 'long', day: 'numeric', month: 'long'});
      const day = days.get(key) ?? {peak: null, offline: 0};
      if (p.online && p.peak != null) day.peak = Math.max(day.peak ?? 0, p.peak);
      if (p.online === false) day.offline++;
      days.set(key, day);
    }
    return [...days];
  });
</script>

<div class="online-chart">
  {#if stats}
    <p class="summary">
      Пик <b>{stats.top.peak}</b> · в среднем <b>{stats.average}</b> · в сети <b>{stats.uptime}%</b> времени
    </p>
  {:else}
    <p class="summary">Всю неделю сервер был недоступен</p>
  {/if}

  {#if stats}
  <div class="plot" bind:clientWidth={width}>
    <svg {width} height={HEIGHT} role="img" aria-label="График онлайна за неделю, итоги — в таблице ниже"
         onpointermove={onMove} onpointerleave={() => hoverIndex = null}>
      <defs>
        <pattern id="offline-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="6" height="6" class="hatch-bg"/>
          <line x1="0" y1="0" x2="0" y2="6" class="hatch-line"/>
        </pattern>
      </defs>

      {#each gridValues as v (v)}
        <line class="grid" x1={PAD.left} x2={PAD.left + plotW} y1={y(v)} y2={y(v)}/>
        <text class="axis-label" x={PAD.left - 6} y={y(v)} text-anchor="end" dominant-baseline="middle">{v}</text>
      {/each}

      {#each offlineRuns as [from, to] (from)}
        <rect class="offline" x={x(from) - halfStep} y={PAD.top}
              width={Math.max(2, x(to) - x(from) + 2 * halfStep)} height={plotH} fill="url(#offline-hatch)"/>
      {/each}

      {#each segments as seg (seg[0])}
        <path class="area" d={areaPath(seg)}/>
        <path class="line" d={linePath(seg)}/>
      {/each}

      {#each dayTicks as tick (tick.i)}
        <line class="tick" x1={x(tick.i)} x2={x(tick.i)} y1={PAD.top + plotH} y2={PAD.top + plotH + 4}/>
        <text class="axis-label" x={x(tick.i)} y={HEIGHT - 6} text-anchor="middle">{tick.label}</text>
      {/each}

      {#if hovered}
        <line class="crosshair" x1={x(hoverIndex)} x2={x(hoverIndex)} y1={PAD.top} y2={PAD.top + plotH}/>
        {#if hovered.online && hovered.peak != null}
          <circle class="dot" cx={x(hoverIndex)} cy={y(hovered.peak)} r="4"/>
        {/if}
      {/if}

      <!-- Зона наведения шире линии: вся область графика -->
      <rect class="hit" x="0" y="0" {width} height={HEIGHT}/>
    </svg>

    {#if hovered}
      <div class="tooltip" style:left="{x(hoverIndex)}px" class:flip={x(hoverIndex) > width * 0.7}>
        <span class="tooltip-time">{formatHour(hovered.hour)}</span>
        {#if hovered.online && hovered.peak != null}
          <span>Пик <b>{hovered.peak}</b>{hovered.max ? ` из ${hovered.max}` : ''}</span>
          <span>В среднем {hovered.average}</span>
        {:else if hovered.online === false}
          <span>Сервер был офлайн</span>
        {:else}
          <span>Нет данных</span>
        {/if}
      </div>
    {/if}
  </div>
  {/if}

  <table class="hidden">
    <caption>Онлайн по дням за неделю</caption>
    <thead><tr><th>День</th><th>Пик игроков</th><th>Часов офлайн</th></tr></thead>
    <tbody>
      {#each daily as [day, d] (day)}
        <tr><td>{day}</td><td>{d.peak ?? '—'}</td><td>{d.offline}</td></tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  /* Цвет серии проверен валидатором dataviz: светлая тема — #4E7A34 на #FFFDF7, тёмная — #6B9A4B на #333 */
  .online-chart {
    --chart-line: var(--color-green-deep);
    --chart-grid: var(--color-stone-light);
    --chart-ink: var(--color-stone);
    font-family: var(--font-ui);
  }

  :global(.themed.dark) .online-chart {
    --chart-line: var(--color-green-main);
    --chart-grid: #4A4A4A;
  }

  .summary {
    margin: 0 0 8px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--chart-ink);

    b {
      font-weight: 400;
      color: var(--color-coal);
    }
  }

  .plot {
    position: relative;
    width: 100%;
  }

  svg {
    display: block;
    overflow: visible;
    touch-action: pan-y;
  }

  .grid {
    stroke: var(--chart-grid);
    stroke-width: 1;
  }

  .tick {
    stroke: var(--chart-grid);
  }

  .axis-label {
    font-family: var(--font-ui);
    font-size: 12px;
    fill: var(--chart-ink);
  }

  .area {
    fill: var(--chart-line);
    opacity: .14;
  }

  .line {
    fill: none;
    stroke: var(--chart-line);
    stroke-width: 2;
    stroke-linejoin: round;
  }

  .hatch-bg {
    fill: transparent;
  }

  .hatch-line {
    stroke: var(--chart-grid);
    stroke-width: 2;
  }

  .crosshair {
    stroke: var(--chart-ink);
    stroke-width: 1;
  }

  /* Кольцо цвета подложки отделяет точку от линии */
  .dot {
    fill: var(--chart-line);
    stroke: var(--color-birch);
    stroke-width: 2;
  }

  .hit {
    fill: transparent;
    cursor: crosshair;
  }

  .tooltip {
    position: absolute;
    top: 0;
    transform: translateX(12px);
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    pointer-events: none;
    white-space: nowrap;

    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-birch);
    background-color: var(--color-coal);
    border-radius: var(--ui-radius);

    &.flip {
      transform: translateX(calc(-100% - 12px));
    }

    /* Глобальный стиль span задаёт тёмный цвет и свой шрифт — на тёмной подсказке текст пропадал */
    span {
      font-family: var(--font-ui);
      color: inherit;
    }

    b {
      font-weight: 400;
    }
  }

  .tooltip .tooltip-time {
    color: var(--color-stone-light);
  }
</style>
