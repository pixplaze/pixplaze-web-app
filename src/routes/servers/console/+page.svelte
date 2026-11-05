<script>
  import ActiveServerGate from '$components/servers/ActiveServerGate.svelte';
  import ConsoleBox from '$components/console/ConsoleBox.svelte';
</script>

<ActiveServerGate type="API" permission="MC_CONSOLE_READ" unsupported="Консоль недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <ConsoleBox serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
