<script>
  import ActiveServerGate from '$lib/components/ActiveServerGate.svelte';
  import CommandPrompt from '$lib/components/CommandPrompt.svelte';
</script>

<ActiveServerGate type="API" permission="MC_CONSOLE_READ" unsupported="Консоль недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <CommandPrompt serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
