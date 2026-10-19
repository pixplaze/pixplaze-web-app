<script>
  import ActiveServerGate from '$lib/components/ActiveServerGate.svelte';
  import ChatBox from '$lib/components/ChatBox.svelte';
</script>

<ActiveServerGate type="API" permission="MC_CHAT_READ" unsupported="Чат недоступен: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <ChatBox serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
