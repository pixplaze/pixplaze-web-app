<script>
  import ActiveServerGate from '$lib/components/ActiveServerGate.svelte';
  import CommandPrompt from '$lib/components/CommandPrompt.svelte';
</script>

<ActiveServerGate type="API" unsupported="Консоль недоступна: на сервере не установлен плагин Pixplaze">
  {#snippet children(address)}
    <CommandPrompt host={address} path="chat"/>
  {/snippet}
</ActiveServerGate>
