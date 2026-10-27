<script>
  import ActiveServerGate from '$components/servers/ActiveServerGate.svelte';
  import CommandPrompt from '$components/console/CommandPrompt.svelte';
</script>

<ActiveServerGate type="API" permission="MC_CONSOLE_READ" unsupported="Консоль недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <CommandPrompt serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
