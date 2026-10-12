<script>
  import ServerCard from '$lib/components/ServerCard.svelte';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import {api} from '$lib/scripts/api/api.config.js';
  import {createDebounce} from '$lib/scripts/util/utils.js';
  import ServerBidForm from "$lib/components/ServerBidForm.svelte";
  import Loader from "$lib/components/ui/Loader.svelte";
  import {mapServer} from '$lib/scripts/util/server.mapper.js';

  let {data} = $props();

  let servers = $state(data.servers.map(mapServer));
  let searchQuery = $state('');

  const searchDebounce = createDebounce(async (query, signal) => {
    const res = await api.get(`/servers?search=${encodeURIComponent(query.trim())}`, {signal});
    if (res.ok) {
      servers = (await res.json()).map(mapServer);
    }
  }, 300);

  $effect(() => {
    if (!searchQuery.trim()) {
      searchDebounce.cancel();
      servers = data.servers.map(mapServer);
      return;
    }
    searchDebounce.run(searchQuery);
  });
</script>

<section class="server-search">
  <h1>Поиск Minecraft серверов</h1>
  <Input id="servers-search" placeholder="Поиск серверов..." bind:value={searchQuery}/>
  <Loader loading={true}/>
</section>
<section class="server-bid-pane">
  <h1>Подключить сервер</h1>
  <ServerBidForm/>
</section>
<section class="servers-pane">
  <h1>Список Minecraft серверов</h1>
  <div class="server-list">
    {#each servers as server}
      <ServerCard {server}/>
    {/each}
  </div>
</section>

<style>
  section {
    padding-top: var(--ui-spacing);
  }
  section > * {
    padding-bottom: var(--ui-spacing);
  }

  .server-list {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
    gap: var(--ui-spacing);
    width: 100%;
  }

  .server-bid-pane {
    padding-top: var(--ui-spacing);
  }
</style>
