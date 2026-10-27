<script>
  import ActiveServerGate from '$components/servers/ActiveServerGate.svelte';
  import ServerMap from '$components/servers/ServerMap.svelte';
</script>

<ActiveServerGate type="MAP" unsupported="Карта недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address)}
    <ServerMap {address}/>
  {/snippet}
</ActiveServerGate>
