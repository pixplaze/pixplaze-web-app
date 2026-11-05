<script>
  /**
   * Диалог наказания — бан или мут: срок (готовые варианты или свой) и причина; у бана — ещё «по IP».
   * По умолчанию бан на 5 лет, мут на 1 день. onConfirm({reason, durationMs, byIp}) — durationMs null — навсегда.
   * Открывается методом open().
   */
  let {kind, playerName, onConfirm} = $props();

  const MIN = 60_000, HOUR = 60 * MIN, DAY = 24 * HOUR, YEAR = 365 * DAY;
  const KINDS = {
    ban: {
      title: 'Забанить',
      submit: 'Забанить',
      hint: 'Игрок не сможет зайти на сервер до конца срока. Причину увидят он и другие модераторы.',
      presets: [
        {id: '1d', label: '1 день', ms: DAY},
        {id: '7d', label: '7 дней', ms: 7 * DAY},
        {id: '30d', label: '30 дней', ms: 30 * DAY},
        {id: '1y', label: '1 год', ms: YEAR},
        {id: '5y', label: '5 лет', ms: 5 * YEAR},
        {id: 'forever', label: 'Навсегда', ms: null}
      ],
      defaultPreset: '5y',
      reasons: ['Читы', 'Гриферство', 'Воровство', 'Обход бана']
    },
    mute: {
      title: 'Замутить',
      submit: 'Замутить',
      hint: 'Игрок не сможет писать в чат до конца срока.',
      presets: [
        {id: '15m', label: '15 минут', ms: 15 * MIN},
        {id: '1h', label: '1 час', ms: HOUR},
        {id: '1d', label: '1 день', ms: DAY},
        {id: '7d', label: '7 дней', ms: 7 * DAY},
        {id: '30d', label: '30 дней', ms: 30 * DAY}
      ],
      defaultPreset: '1d',
      reasons: ['Оскорбления', 'Спам', 'Реклама', 'Флуд']
    }
  };
  const UNITS = [
    {id: 'min', label: 'минут', ms: MIN},
    {id: 'hour', label: 'часов', ms: HOUR},
    {id: 'day', label: 'дней', ms: DAY},
    {id: 'year', label: 'лет', ms: YEAR}
  ];

  const config = $derived(KINDS[kind]);

  let dialog = $state();
  let preset = $state('');
  let customAmount = $state(1);
  let customUnit = $state('day');
  let reason = $state('');
  let byIp = $state(false);

  const durationMs = $derived(preset === 'custom'
      ? Math.max(1, Number(customAmount) || 0) * UNITS.find((u) => u.id === customUnit).ms
      : config.presets.find((p) => p.id === preset)?.ms ?? null);

  /** Когда закончится — показываем сразу, чтобы модератор видел дату, а не только «5 лет». */
  const endsLabel = $derived(durationMs == null ? 'навсегда'
      : `до ${new Date(Date.now() + durationMs).toLocaleString(undefined, {day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'})}`);

  export function open() {
    preset = config.defaultPreset;
    customAmount = 1;
    customUnit = 'day';
    reason = '';
    byIp = false;
    dialog.showModal();
  }

  const submit = async (event) => {
    event.preventDefault();
    await onConfirm({reason: reason.trim(), durationMs, byIp: kind === 'ban' && byIp});
    dialog.close();
  };
</script>

<dialog class="dialog" bind:this={dialog} aria-labelledby="{kind}-title">
  <form onsubmit={submit}>
    <h3 id="{kind}-title">{config.title} {playerName}</h3>
    <p class="hint">{config.hint}</p>

    <fieldset class="field">
      <legend>Срок</legend>
      <div class="options">
        {#each config.presets as option (option.id)}
          <label class="option">
            <input type="radio" name="{kind}-term" value={option.id} bind:group={preset}/>{option.label}
          </label>
        {/each}
        <label class="option">
          <input type="radio" name="{kind}-term" value="custom" bind:group={preset}/>Свой
        </label>
      </div>
      {#if preset === 'custom'}
        <div class="custom">
          <input type="number" min="1" bind:value={customAmount} aria-label="Количество"/>
          <select bind:value={customUnit} aria-label="Единица">
            {#each UNITS as unit (unit.id)}<option value={unit.id}>{unit.label}</option>{/each}
          </select>
        </div>
      {/if}
      <span class="ends">{endsLabel}</span>
    </fieldset>

    <div class="field">
      <span class="label" id="{kind}-reason-label">Причина</span>
      <div class="presets">
        {#each config.reasons as option (option)}
          <button type="button" class="preset" aria-pressed={reason === option} onclick={() => reason = option}>{option}</button>
        {/each}
      </div>
      <textarea rows="2" bind:value={reason} required aria-labelledby="{kind}-reason-label"
                placeholder="Что произошло — увидят игрок и другие модераторы"></textarea>
    </div>

    {#if kind === 'ban'}
      <label class="check">
        <input type="checkbox" bind:checked={byIp}/>
        <span>Бан по IP <small>— с этого адреса не зайдёт ни один аккаунт</small></span>
      </label>
    {/if}

    <div class="dialog-actions">
      <button type="button" class="button" onclick={() => dialog.close()}>Отмена</button>
      <button type="submit" class="button danger" disabled={!reason.trim()}>{config.submit}</button>
    </div>
  </form>
</dialog>

<style>
  .dialog {
    width: min(500px, calc(100vw - 32px));
    padding: 20px;
    font-family: var(--font-ui);
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: 6px 6px 0 0 var(--color-outline-shadow-hover);

    &::backdrop {
      background-color: rgba(38, 43, 34, .45);
    }
  }

  span, small, legend, label, textarea, select, input, option {
    font-family: var(--font-ui);
  }

  form {
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  h3 {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 24px;
    font-weight: 400;
    overflow-wrap: anywhere;
  }

  .hint {
    margin: 0;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-stone);
  }

  .field {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin: 0;
    padding: 0;
    border: none;
  }

  legend,
  .label {
    margin-bottom: 2px;
    padding: 0;
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--color-stone);
  }

  .options {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  /* Вариант срока — чип с радиокнопкой внутри: видно, что выбирается один */
  .option {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 32px;
    padding: 0 10px;
    font-size: 18px;
    background-color: var(--color-sandstone);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    cursor: pointer;

    &:has(input:checked) {
      color: var(--color-birch);
      background-color: var(--color-redstone);
      border-color: #8E2F26;
    }

    &:has(input:focus-visible) {
      outline: var(--ui-size-border) solid var(--color-ui-focus);
      outline-offset: 2px;
    }

    input {
      margin: 0;
      accent-color: var(--color-redstone);
    }
  }

  .custom {
    display: flex;
    gap: 8px;

    input,
    select {
      height: 36px;
      padding: 0 10px;
      font-size: 18px;
      color: var(--color-coal);
      background-color: #FFFFFF;
      border: var(--ui-nb-border);
      border-radius: var(--ui-radius);
    }

    input {
      width: 90px;
    }
  }

  .ends {
    font-size: 12px;
    color: var(--color-stone);
  }

  .presets {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .preset {
    height: 28px;
    padding: 0 10px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-coal);
    background-color: var(--color-sandstone);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    cursor: pointer;

    &[aria-pressed="true"] {
      color: var(--color-birch);
      background-color: var(--color-stone);
      border-color: var(--color-coal);
    }
  }

  textarea {
    box-sizing: border-box;
    width: 100%;
    padding: 8px 10px;
    font-size: 18px;
    color: var(--color-coal);
    background-color: #FFFFFF;
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    resize: vertical;
  }

  .check {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    cursor: pointer;

    input {
      width: 18px;
      height: 18px;
      margin: 0;
      accent-color: var(--color-redstone);
    }

    small {
      font-size: 12px;
      color: var(--color-stone);
    }
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }

  .button {
    display: inline-flex;
    align-items: center;
    height: 40px;
    padding: 0 14px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
    cursor: pointer;

    &:hover {
      background-color: var(--color-sandstone);
    }

    &:disabled {
      opacity: .5;
      cursor: not-allowed;
    }

    &.danger {
      color: var(--color-birch);
      background-color: var(--color-redstone);
      border-color: #8E2F26;
      box-shadow: 3px 3px 0 0 #8E2F26;
    }
  }
</style>
