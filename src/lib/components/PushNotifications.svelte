<script>
  import {onMount} from 'svelte';
  import {disablePushNotifications, enablePushNotifications, getPushUiState} from '#scripts/push.pwa.js';
  import Delimiter from "#ui/Delimiter.svelte";

  let state = $state({ kind: 'checking' });
  let busy = $state(false);
  let message = $state('');
  let isError = $state(false);

  async function refresh() {
    state = await getPushUiState();
  }

  async function enable() {
    busy = true;
    message = '';
    isError = false;

    try {
      await enablePushNotifications();
      message = 'Подписка на уведомления сохранена.';
      await refresh();
    } catch (error) {
      isError = true;
      message = error instanceof Error ? error.message : 'Не удалось включить уведомления.';
      await refresh();
    } finally {
      busy = false;
    }
  }

  async function disable() {
    busy = true;
    message = '';
    isError = false;

    try {
      await disablePushNotifications();
      message = 'Подписка отключена.';
      await refresh();
    } catch (error) {
      isError = true;
      message = error instanceof Error ? error.message : 'Не удалось отключить уведомления.';
    } finally {
      busy = false;
    }
  }

  onMount(() => {
    void refresh();
  });
</script>

<section class="push-settings" aria-labelledby="push-settings-title">
  <Delimiter value="уведомления"/>

  {#if state.kind === 'checking'}
    <p>Проверяем поддержку уведомлений…</p>
  {:else if state.kind === 'disabled'}
    <p>Push-уведомления подготовлены, но пока отключены в конфигурации приложения. Остальная функциональность PWA работает.</p>
  {:else if state.kind === 'misconfigured'}
    <p>{state.reason}</p>
  {:else if state.kind === 'unsupported'}
    <p>{state.reason}</p>
  {:else if state.kind === 'install-required'}
    <p>{state.reason}</p>
  {:else if state.kind === 'permission-denied'}
    <p>Разрешение запрещено. Измените его в настройках уведомлений браузера или устройства.</p>
  {:else if state.kind === 'subscribed'}
    <p>В этом браузере уже есть push-подписка. Можно повторно синхронизировать её с аккаунтом.</p>
    <div class="actions">
      <button type="button" onclick={enable} disabled={busy}>
        {busy ? 'Подождите…' : 'Синхронизировать подписку'}
      </button>
      <button type="button" onclick={disable} disabled={busy}>
        Отключить
      </button>
    </div>
  {:else}
    <p>Разрешите уведомления, чтобы получать важные события, даже когда приложение закрыто.</p>
    <button type="button" onclick={enable} disabled={busy}>
      {busy ? 'Подождите…' : 'Включить уведомления'}
    </button>
  {/if}

  {#if message}
    <p role="status" aria-live="polite" class:error={isError}>{message}</p>
  {/if}
</section>

<style>
  .push-settings {
    display: grid;
    gap: 0.75rem;
  }

  .push-settings h2,
  .push-settings p {
    margin: 0;
  }

  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  button {
    min-height: 2.5rem;
    padding: 0.5rem 0.9rem;
    border: 1px solid currentColor;
    border-radius: 0.5rem;
    font: inherit;
    cursor: pointer;
  }

  button:disabled {
    cursor: wait;
    opacity: 0.6;
  }

  .error {
    color: #b42318;
  }
</style>
