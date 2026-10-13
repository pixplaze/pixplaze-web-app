<script>
  import {activeServer} from '$lib/scripts/activeServer.svelte.js';
  import {hostAddress} from '$lib/scripts/util/server.mapper.js';

  /**
   * Показывает содержимое для активного сервера, если у него есть адрес нужного типа.
   * Иначе — сообщение: сервер не выбран или не поддерживает раздел (нет плагина Pixplaze).
   *
   * type — тип адреса из `hosts` (MAP, API); unsupported — сообщение при его отсутствии;
   * children(address) — содержимое, получает адрес `address:port`.
   */
  const {type, unsupported, children} = $props();

  const server = $derived(activeServer.server);
  const address = $derived(hostAddress(server?.hosts, type));
</script>

{#if !server}
  <p class="active-server-message">Сервер не выбран</p>
{:else if !address}
  <p class="active-server-message">{unsupported}</p>
{:else}
  <!-- Другой сервер или адрес — содержимое пересоздаётся (переподключение консоли) -->
  {#key address}
    {@render children?.(address)}
  {/key}
{/if}

<style>
  .active-server-message {
    margin: 0;
    padding: var(--ui-spacing);
    text-align: center;
    color: var(--color-text-secondary);
  }
</style>
