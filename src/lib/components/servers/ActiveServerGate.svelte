<script>
  import {activeServer} from '$scripts/activeServer.svelte.js';
  import {hostAddress} from '$util/server.mapper.js';
  import {permissions} from '$scripts/permissions.svelte.js';
  import {pluginTokens} from '$scripts/pluginTokens.svelte.js';
  import {PluginAccessDeniedError} from '$api/servers.api.js';

  /**
   * Показывает содержимое для активного сервера, если у него есть адрес нужного типа.
   * Иначе — сообщение: сервер ещё загружается, не выбран или не поддерживает раздел (нет плагина Pixplaze).
   *
   * Для адреса API (плагин) ещё и доступ: подсказка прав (`permission` — имя права из каталога,
   * например `MC_CONSOLE_READ`) и обмен на токен доступа к плагину — 403 значит, что у профиля
   * на сервере нет ролей. Подсказка только прячет экран, решение принимает плагин.
   *
   * type — тип адреса из `hosts` (MAP, API); unsupported — сообщение при его отсутствии;
   * permission — имя права из каталога, без него подсказка не проверяется;
   * children(address, serverId) — содержимое, получает адрес `address:port` и id сервера.
   */
  const {type, unsupported, permission, children} = $props();

  const server = $derived(activeServer.server);
  const address = $derived(hostAddress(server?.hosts, type));
  const needsPlugin = $derived(type === 'API');
  // Каталог ещё не загружен — экран не прячем: решение всё равно за плагином
  const permitted = $derived(!permission || !server || !permissions.catalog[permission]
      || permissions.canOn(server.id, permissions.catalog[permission]));

  /** Обмен на токен доступа к плагину: 'pending' | 'granted' | 'denied' | 'failed'. */
  let access = $state('pending');

  $effect(() => {
    $inspect('active:', activeServer.server);
    if (!needsPlugin || !server || !address || !permitted) return;
    const serverId = server.id;
    access = 'pending';
    pluginTokens.get(serverId)
        .then(() => activeServer.isActive(serverId) && (access = 'granted'))
        .catch((error) => activeServer.isActive(serverId) &&
            (access = error instanceof PluginAccessDeniedError ? 'denied' : 'failed'));
  });
</script>

{#if activeServer.loading}
  <p class="active-server-message">Загрузка…</p>
{:else if !server}
  <p class="active-server-message">Сервер не выбран</p>
{:else if !address}
  <p class="active-server-message">{unsupported}</p>
{:else if !permitted || (needsPlugin && access === 'denied')}
  <p class="active-server-message">Нет доступа: нужны права на этом сервере</p>
{:else if needsPlugin && access === 'pending'}
  <p class="active-server-message">Подключение…</p>
{:else if needsPlugin && access === 'failed'}
  <p class="active-server-message">Не удалось получить доступ к серверу, попробуйте позже</p>
{:else}
  {@render children?.(address, server.id)}
{/if}

<style>
  .active-server-message {
    margin: 0;
    padding: var(--ui-spacing);
    text-align: center;
    color: var(--color-text-primary);
  }
</style>
