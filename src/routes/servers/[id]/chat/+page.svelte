<script>
  import ActiveServerGate from '$components/servers/ActiveServerGate.svelte';
  import ChatBox from '$components/console/ChatBox.svelte';
</script>

<ActiveServerGate type="API" permission="MC_CHAT_READ" unsupported="Чат недоступен: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <ChatBox serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
