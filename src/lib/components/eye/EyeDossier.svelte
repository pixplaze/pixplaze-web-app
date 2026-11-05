<script>
  import Icon from '$ui/Icon.svelte';
  import EyeAvatar from '$components/eye/EyeAvatar.svelte';
  import EyePunishDialog from '$components/eye/EyePunishDialog.svelte';
  import EyeActivityLog from '$components/eye/EyeActivityLog.svelte';
  import EyeComplaints from '$components/eye/EyeComplaints.svelte';
  import {copyToClipboard} from '$util/dom.util.js';
  import {pointerHint} from '$scripts/pointerHint.svelte.js';
  import {relativeTime, duration} from '$components/eye/eyeFormat.js';

  /**
   * Досье выбранного игрока, блоками сверху вниз:
   *   1. кто это — голова скина с точкой статуса, ник и UUID (по клику копируются),
   *      рядом с ником — значки подозрения, бана и мута;
   *   2. время — сколько наиграл и когда впервые зашёл на этот сервер, когда зарегистрировался на Pixplaze,
   *      сколько на игрока жалоб;
   *   3. действия — бан, мут, кик, подозрение; бан и мут — через диалог со сроком и причиной;
   *   4. вкладки: журнал действий и жалобы.
   */
  let {eye, onBack} = $props();
  const player = $derived(eye.selected);

  let banDialog = $state();
  let muteDialog = $state();
  let kickDialog = $state();
  let kickReason = $state('');
  let suspectDialog = $state();
  let suspectNote = $state('');

  const date = (d) => d.toLocaleDateString(undefined, {day: 'numeric', month: 'long', year: 'numeric'});
  // Короткий срок — с временем: «до 6 ноября 2026 г. в 04:06», длинный — только дата
  const punishmentEnd = (p) => {
    if (!p.until) return 'навсегда';
    const soon = new Date(p.until) - Date.now() < 2 * 24 * 3600_000;
    return `до ${new Date(p.until).toLocaleString(undefined, {day: 'numeric', month: 'long', year: 'numeric',
      ...(soon ? {hour: '2-digit', minute: '2-digit'} : {})})}`;
  };
  /** Значки у ника: что с игроком сейчас, подробности — в подсказке. */
  const marks = $derived(!player ? [] : [
    player.suspect && {id: 'suspect', icon: 'eye',
      title: `Подозреваемый: ${player.suspect.note} — ${player.suspect.by}, ${relativeTime(player.suspect.at)}`},
    player.ban && {id: 'ban', icon: 'lock',
      title: `Забанен${player.ban.byIp ? ' по IP' : ''} ${punishmentEnd(player.ban)}: ${player.ban.reason}`},
    player.mute && {id: 'mute', icon: 'mute', title: `Замучен ${punishmentEnd(player.mute)}: ${player.mute.reason}`}
  ].filter(Boolean));

  const TABS = [
    {id: 'log', label: 'Журнал действий', icon: 'console'},
    {id: 'complaints', label: 'Жалобы', icon: 'flag'}
  ];

  const onTabKey = (event) => {
    const step = {ArrowRight: 1, ArrowLeft: -1}[event.key];
    if (!step) return;
    const next = TABS[(TABS.findIndex((t) => t.id === eye.tab) + step + TABS.length) % TABS.length];
    eye.tab = next.id;
    event.currentTarget.parentElement.querySelector(`[data-tab="${next.id}"]`)?.focus();
  };

  const openKick = () => {
    kickReason = '';
    kickDialog.showModal();
  };

  const openSuspect = () => {
    suspectNote = '';
    suspectDialog.showModal();
  };

  const confirmKick = async (event) => {
    event.preventDefault();
    await eye.kick(kickReason.trim());
    kickDialog.close();
  };

  const confirmSuspect = async (event) => {
    event.preventDefault();
    await eye.markSuspect(suspectNote.trim());
    suspectDialog.close();
  };

  const copy = async (event, value, label) => {
    try {
      await copyToClipboard(value);
      pointerHint.show(`${label} скопирован`, event);
    } catch {
      pointerHint.show('Не удалось скопировать', event);
    }
  };
</script>

{#if player}
  <article class="dossier">
    {#if onBack}
      <button type="button" class="back" onclick={onBack}>← Все игроки</button>
    {/if}

    <!-- 1. Кто это -->
    <div class="block identity">
      <EyeAvatar {player} size={64}/>
      <div class="who">
        <h2>
          <button type="button" class="name" title="Скопировать ник" onclick={(e) => copy(e, player.name, 'Ник')}>{player.name}</button>
          {#each marks as mark (mark.id)}
            <span class="mark {mark.id}" title={mark.title}><Icon icon={mark.icon}/><span class="hidden">{mark.title}</span></span>
          {/each}
        </h2>
        <button type="button" class="uuid" title="Скопировать UUID" onclick={(e) => copy(e, player.uuid, 'UUID')}>{player.uuid}</button>
      </div>
    </div>

    <!-- 2. Время -->
    <dl class="block facts">
      <div class="fact">
        <dt>Наиграл на сервере</dt>
        <dd>{duration(player.playtimeMs)}</dd>
      </div>
      <div class="fact">
        <dt>Впервые на сервере</dt>
        <dd>{date(player.firstSeen)}</dd>
      </div>
      <div class="fact">
        <dt>На Pixplaze</dt>
        {#if player.profileRegisteredAt}
          <dd>с {date(player.profileRegisteredAt)} <small>— {player.profileName}</small></dd>
        {:else}
          <dd class="muted">нет профиля</dd>
        {/if}
      </div>
      {#if player.complaintsCount}
        <div class="fact">
          <dt>Жалобы на игрока</dt>
          <dd>
            <button type="button" class="complaints-link" onclick={() => { eye.tab = 'complaints'; eye.complaintDirection = 'against'; }}>
              <Icon icon="flag"/>{player.complaintsCount}
            </button>
          </dd>
        </div>
      {/if}
    </dl>

    <!-- 3. Действия; действующие наказания — строкой под кнопками -->
    <div class="block actions">
      <div class="buttons">
        {#if player.ban}
          <button type="button" class="action" onclick={() => eye.unban()}><Icon icon="unlock"/>Разбанить</button>
        {:else}
          <button type="button" class="action danger" onclick={() => banDialog.open()}><Icon icon="lock"/>Забанить</button>
        {/if}
        {#if player.mute}
          <button type="button" class="action" onclick={() => eye.unmute()}><Icon icon="chat"/>Снять мут</button>
        {:else}
          <button type="button" class="action" onclick={() => muteDialog.open()}><Icon icon="mute"/>Замутить</button>
        {/if}
        <button type="button" class="action" disabled={!player.online} onclick={openKick}
                title={player.online ? 'Выгнать с сервера' : 'Игрока сейчас нет на сервере'}><Icon icon="sign-out"/>Кикнуть</button>
        {#if player.suspect}
          <button type="button" class="action" onclick={() => eye.clearSuspect()}><Icon icon="eye"/>Снять подозрение</button>
        {:else}
          <button type="button" class="action" onclick={openSuspect}><Icon icon="eye"/>Сделать подозреваемым</button>
        {/if}
      </div>
      {#if player.ban || player.mute}
        <ul class="punishments">
          {#if player.ban}
            <li class="punishment"><Icon icon="lock"/><span>Бан{player.ban.byIp ? ' по IP' : ''} {punishmentEnd(player.ban)}: {player.ban.reason} — {player.ban.by}, {relativeTime(player.ban.at)}</span></li>
          {/if}
          {#if player.mute}
            <li class="punishment"><Icon icon="mute"/><span>Мут {punishmentEnd(player.mute)}: {player.mute.reason} — {player.mute.by}, {relativeTime(player.mute.at)}</span></li>
          {/if}
        </ul>
      {/if}
    </div>

    <!-- 4. Журнал и жалобы -->
    <div class="tabs" role="tablist" aria-label="Журнал и жалобы">
      {#each TABS as tab (tab.id)}
        <button type="button" role="tab" class="tab" id="eye-tab-{tab.id}" data-tab={tab.id}
                aria-selected={eye.tab === tab.id} aria-controls="eye-panel-{tab.id}" tabindex={eye.tab === tab.id ? 0 : -1}
                onclick={() => eye.tab = tab.id} onkeydown={onTabKey}>
          <Icon icon={tab.icon}/>{tab.label}
          {#if tab.id === 'complaints' && eye.complaintCounts.against}<span class="tab-count" title="Жалоб на игрока">{eye.complaintCounts.against}</span>{/if}
        </button>
      {/each}
    </div>
    <div class="tab-panel" role="tabpanel" id="eye-panel-{eye.tab}" aria-labelledby="eye-tab-{eye.tab}">
      {#if eye.tab === 'complaints'}
        <EyeComplaints {eye}/>
      {:else}
        <EyeActivityLog {eye}/>
      {/if}
    </div>
  </article>

  <EyePunishDialog bind:this={banDialog} kind="ban" playerName={player.name}
                   onConfirm={({reason, durationMs, byIp}) => eye.ban(reason, durationMs, byIp)}/>
  <EyePunishDialog bind:this={muteDialog} kind="mute" playerName={player.name}
                   onConfirm={({reason, durationMs}) => eye.mute(reason, durationMs)}/>

  <dialog class="dialog" bind:this={kickDialog} aria-labelledby="kick-title">
    <form onsubmit={confirmKick}>
      <h3 id="kick-title">Кикнуть {player.name}</h3>
      <p class="hint">Игрок вылетит с сервера и сможет сразу зайти снова.</p>
      <label class="field">
        <span>Причина <small>— необязательно, игрок увидит её на экране</small></span>
        <textarea rows="2" bind:value={kickReason} placeholder="Например: перезайди, ты застрял в блоке"></textarea>
      </label>
      <div class="dialog-actions">
        <button type="button" class="action" onclick={() => kickDialog.close()}>Отмена</button>
        <button type="submit" class="action danger">Кикнуть</button>
      </div>
    </form>
  </dialog>

  <dialog class="dialog" bind:this={suspectDialog} aria-labelledby="suspect-title">
    <form onsubmit={confirmSuspect}>
      <h3 id="suspect-title">{player.name} — в подозреваемые</h3>
      <p class="hint">Игрок поднимется наверх списка, рядом с ником появится глаз. Заметку увидят все модераторы сервера.</p>
      <label class="field">
        <span>Что не так</span>
        <textarea rows="3" bind:value={suspectNote} required placeholder="Например: подозрительно много алмазов, проверить журнал за вчера"></textarea>
      </label>
      <div class="dialog-actions">
        <button type="button" class="action" onclick={() => suspectDialog.close()}>Отмена</button>
        <button type="submit" class="action" disabled={!suspectNote.trim()}>Добавить</button>
      </div>
    </form>
  </dialog>
{:else}
  <p class="placeholder">{eye.loading ? 'Загрузка досье…' : 'Выберите игрока слева'}</p>
{/if}

<style>
  .dossier {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 0;
    font-family: var(--font-ui);
    color: var(--color-coal);
  }

  span, small, textarea, label, dt, dd {
    font-family: var(--font-ui);
  }

  .back {
    align-self: flex-start;
    padding: 0;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-stone);
    background: none;
    border: none;
    cursor: pointer;
  }

  .block {
    box-sizing: border-box;
    margin: 0;
    padding: 14px 16px;
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    box-shadow: var(--ui-nb-shadow);
  }

  /* 1. Голова скина, ник и UUID */
  .identity {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .who {
    display: flex;
    flex-direction: column;
    gap: 6px;
    min-width: 0;
  }

  h2 {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
    margin: 0;
    font-family: var(--font-ui);
    font-size: 36px;
    font-weight: 400;
    line-height: 1;
    overflow-wrap: anywhere;
  }

  .name {
    padding: 0;
    font: inherit;
    color: inherit;
    text-align: left;
    background: none;
    border: none;
    cursor: copy;

    &:hover {
      text-decoration: underline dashed 2px;
      text-underline-offset: 6px;
    }
  }

  /* Значки состояния у ника: подозрение — золото, бан и мут — красный */
  .mark {
    display: inline-grid;
    place-items: center;
    color: var(--color-redstone);
    cursor: help;

    &.suspect {
      color: var(--color-gold);
    }

    :global(svg.icon) {
      width: 32px;
      height: 32px;
    }
  }

  .uuid {
    align-self: flex-start;
    max-width: 100%;
    padding: 0;
    overflow: hidden;
    font-family: var(--font-ui);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--color-stone);
    background: none;
    border: none;
    cursor: copy;

    &:hover {
      color: var(--color-coal);
    }
  }

  /* 2. Время на сервере и на Pixplaze — ячейки в ряд */
  .facts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(170px, 1fr));
    gap: 12px 0;
  }

  .fact {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 0 16px;
    border-left: 1px solid var(--color-stone-light);

    &:first-child {
      padding-left: 0;
      border-left: none;
    }
  }

  dt {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: .04em;
    color: var(--color-stone);
  }

  dd {
    margin: 0;
    font-size: 24px;
    line-height: 1.1;

    small {
      font-size: 12px;
      color: var(--color-stone);
    }

    &.muted {
      color: var(--color-stone);
    }
  }

  .complaints-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 0;
    font-family: var(--font-ui);
    font-size: inherit;
    color: var(--color-redstone);
    background: none;
    border: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  /* 4. Вкладки — как вкладки панели, но мельче */
  .tabs {
    display: flex;
    gap: 0;
    margin-top: 4px;
    border-bottom: 2px solid var(--color-outline);
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    margin-bottom: -2px;
    padding: 0 14px 0 10px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-stone);
    background: none;
    border: 2px solid transparent;
    border-radius: var(--ui-radius) var(--ui-radius) 0 0;
    cursor: pointer;

    &:hover {
      color: var(--color-coal);
    }

    &[aria-selected="true"] {
      color: var(--color-coal);
      background-color: var(--color-birch);
      border-color: var(--color-outline);
      border-bottom-color: var(--color-birch);
    }

    &:focus-visible {
      outline: var(--ui-size-border) solid var(--color-ui-focus);
      outline-offset: -4px;
    }
  }

  .tab-count {
    padding: 0 6px;
    font-family: var(--font-ui);
    font-size: 12px;
    color: var(--color-birch);
    background-color: var(--color-redstone);
    border-radius: var(--ui-radius);
  }

  .tab-panel {
    min-width: 0;
  }

  /* 3. Действия */
  .actions {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .action {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 12px;
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

    &:active {
      transform: translate(2px, 2px);
      box-shadow: none;
    }

    &:disabled {
      opacity: .45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    &.danger {
      color: var(--color-birch);
      background-color: var(--color-redstone);
      border-color: #8E2F26;
      box-shadow: 3px 3px 0 0 #8E2F26;

      &:hover {
        background-color: #B0423A;
      }
    }

    &:focus-visible {
      outline: var(--ui-size-border) solid var(--color-ui-focus);
      outline-offset: 2px;
    }
  }

  .punishments {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  /* Действующее наказание — словом и пиктограммой */
  .punishment {
    display: flex;
    align-items: flex-start;
    gap: 6px;
    font-size: 18px;
    color: #7A231B;
  }

  .placeholder {
    margin: 0;
    padding: 24px 0;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-stone);
  }

  .dialog {
    width: min(480px, calc(100vw - 32px));
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

    form {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    h3 {
      margin: 0;
      font-family: var(--font-ui);
      font-size: 24px;
      font-weight: 400;
    }
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
    gap: 4px;
    font-size: 12px;
    color: var(--color-stone);

    textarea {
      box-sizing: border-box;
      width: 100%;
      padding: 8px 10px;
      font-family: var(--font-ui);
      font-size: 18px;
      color: var(--color-coal);
      background-color: #FFFFFF;
      border: var(--ui-nb-border);
      border-radius: var(--ui-radius);
      resize: vertical;
    }
  }

  .dialog-actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 4px;
  }

  @media screen and (max-width: 440px) {
    h2 {
      font-size: 24px;
    }

    .facts {
      gap: 10px;
    }

    .fact:nth-child(n) {
      flex-direction: row;
      justify-content: space-between;
      align-items: baseline;
      gap: 12px;
      padding-left: 0;
      border-left: none;
    }

    dd {
      font-size: 18px;
      text-align: right;
    }
  }
</style>
