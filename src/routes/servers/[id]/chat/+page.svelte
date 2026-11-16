<script>
  import ActiveServerGate from '#components/servers/ActiveServerGate.svelte';
  import ChatBox from '#components/console/ChatBox.svelte';
  import {ROUTES} from "#scripts/routes.js";
  import {page} from "$app/state";
  import {goto} from "$app/navigation";

  $effect(() => {
    const serverId = activeServer.server?.id;

    const newUrl = new URL(page.url);
    newUrl.pathname = ROUTES.serversChat(serverId);

    goto(newUrl, {
      shallow: true,
      replace: true,
      reset: true
    });
  });
</script>

<ActiveServerGate type="API" permission="MC_CHAT_READ" unsupported="Чат недоступен: на сервере не установлен плагин Pixplaze">
  {#snippet children(address, serverId)}
    <ChatBox serverId={serverId} host={address}/>
  {/snippet}
</ActiveServerGate>
