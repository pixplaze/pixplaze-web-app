<script>
  import ActiveServerGate from '#components/servers/ActiveServerGate.svelte';
  import ChatBox from '#components/console/ChatBox.svelte';
  import {ROUTES} from "#scripts/routes.js";
  import {patchUrl} from "#scripts/navigation.js";

  $effect(() => {
    const serverId = activeServer.server?.id;
    // console.log('serverId', serverId);
    patchUrl(ROUTES.serversChat(serverId));
  });
</script>

<ActiveServerGate type="API" permission="MC_CHAT_READ" unsupported="Чат недоступен: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <ChatBox serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
