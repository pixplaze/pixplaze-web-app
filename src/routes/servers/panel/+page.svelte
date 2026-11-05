<script>
  import {page} from '$app/state';
  import {replaceState} from '$app/navigation';
  import ActiveServerGate from '$components/servers/ActiveServerGate.svelte';
  import ConsoleBox from '$components/console/ConsoleBox.svelte';
  import EyeOfSauron from '$components/eye/EyeOfSauron.svelte';
  import EyeComplaintInbox from '$components/eye/EyeComplaintInbox.svelte';
  import {existingEye} from '$scripts/eye/eye.svelte.js';
  import Icon from '$ui/Icon.svelte';
  import {activeServer} from '$scripts/activeServer.svelte.js';

  /**
   * Панель управления выбранным сервером: «Око Саурона» (досье игроков), непросмотренные жалобы и консоль.
   * Доступ — как у консоли: плагин на сервере и право читать консоль. Вкладка — в `?tab=`, чтобы
   * ссылкой можно было поделиться.
   */
  const TABS = [
    {id: 'eye', label: 'Око Саурона', icon: 'eye'},
    {id: 'complaints', label: 'Жалобы', icon: 'flag'},
    {id: 'console', label: 'Консоль', icon: 'console'}
  ];

  let tab = $state(TABS.some((t) => t.id === page.url.searchParams.get('tab')) ? page.url.searchParams.get('tab') : 'eye');

  const setTab = (id) => {
    tab = id;
    const url = new URL(page.url);
    url.searchParams.set('tab', id);
    replaceState(url, {});
  };

  /** Счётчик непросмотренных жалоб — когда «Око» сервера уже загружено (любой из его вкладок). */
  const unreviewed = $derived(activeServer.server ? existingEye(activeServer.server.id)?.unreviewedCount ?? 0 : 0);

  /** Стрелки внутри списка вкладок — как у вкладок в ОС. */
  const onKeydown = (event) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    const index = TABS.findIndex((t) => t.id === tab);
    const next = TABS[(index + (event.key === 'ArrowRight' ? 1 : -1) + TABS.length) % TABS.length];
    setTab(next.id);
    event.currentTarget.querySelector(`[data-tab="${next.id}"]`)?.focus();
  };
</script>

<svelte:head>
  <title>Панель управления{activeServer.server ? ` — ${activeServer.server.name}` : ''} — Pixplaze</title>
</svelte:head>

<section class="panel">
  <header class="panel-head">
    <h1>Панель управления{#if activeServer.server}<span class="server-name">{activeServer.server.name}</span>{/if}</h1>
    <div class="tabs" role="tablist" aria-label="Разделы панели" tabindex="-1" onkeydown={onKeydown}>
      {#each TABS as t (t.id)}
        <button type="button" role="tab" class="tab" data-tab={t.id} id="tab-{t.id}"
                aria-selected={tab === t.id} aria-controls="panel-{t.id}" tabindex={tab === t.id ? 0 : -1}
                onclick={() => setTab(t.id)}>
          <Icon icon={t.icon}/>{t.label}
          {#if t.id === 'complaints' && unreviewed}<span class="badge" title="Непросмотренных жалоб">{unreviewed}</span>{/if}
        </button>
      {/each}
    </div>
  </header>

  <ActiveServerGate type="API" permission="MC_CONSOLE_READ"
                    unsupported="Панель недоступна: на сервере не установлен плагин Pixplaze">
    {#snippet children(address, serverId)}
      <div role="tabpanel" id="panel-{tab}" aria-labelledby="tab-{tab}">
        {#if tab === 'eye'}
          <EyeOfSauron {serverId}/>
        {:else if tab === 'complaints'}
          <EyeComplaintInbox {serverId} onOpen={() => setTab('eye')}/>
        {:else}
          <ConsoleBox {serverId} host={address}/>
        {/if}
      </div>
    {/snippet}
  </ActiveServerGate>
</section>

<style>
  .panel {
    padding-top: var(--ui-spacing);
    padding-bottom: var(--ui-spacing);
    font-family: var(--font-ui);
    font-synthesis: none;
    color: var(--color-coal);
  }

  span {
    font-family: var(--font-ui);
  }

  .panel-head {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-end;
    justify-content: space-between;
    gap: 12px 24px;
    margin-bottom: 16px;
  }

  h1 {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 4px 14px;
    margin: 0;
    font-family: var(--font-ui-title);
    font-size: 32px;
    font-weight: 400;
  }

  .server-name {
    font-size: 18px;
    color: var(--color-green-deep);
  }

  .tabs {
    display: flex;
    gap: 6px;
  }

  .tab {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    height: 40px;
    padding: 0 14px 0 10px;
    font-family: var(--font-ui);
    font-size: 18px;
    color: var(--color-coal);
    background-color: var(--color-birch);
    border: var(--ui-nb-border);
    border-radius: var(--ui-radius);
    cursor: pointer;

    &:hover {
      background-color: var(--color-sandstone);
    }

    &[aria-selected="true"] {
      color: var(--color-birch);
      background-color: var(--color-green-main);
      border-color: var(--color-green-deep);
      box-shadow: 3px 3px 0 0 var(--color-green-deep);
    }

    &:focus-visible {
      outline: var(--ui-size-border) solid var(--color-ui-focus);
      outline-offset: 2px;
    }
  }

  .badge {
    min-width: 20px;
    padding: 0 6px;
    font-family: var(--font-ui);
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    color: var(--color-birch);
    background-color: var(--color-redstone);
    border-radius: var(--ui-radius);
  }

  @media screen and (max-width: 440px) {
    .tabs {
      flex-wrap: wrap;
    }

    .tab {
      font-size: 12px;
      height: 36px;
      padding: 0 10px 0 6px;
    }
  }
</style>
