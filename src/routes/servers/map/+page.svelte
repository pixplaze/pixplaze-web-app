<script>
  import ActiveServerGate from '$lib/components/ActiveServerGate.svelte';
  import ServerMap from '$lib/components/ServerMap.svelte';
</script>

<ActiveServerGate type="MAP" unsupported="Карта недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address)}
    <ServerMap {address}/>
  {/snippet}
</ActiveServerGate>
