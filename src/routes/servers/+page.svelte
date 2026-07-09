<script>
  import ServerCard from '$lib/components/ServerCard.svelte';
  import Input from '$lib/components/ui/inputs/Input.svelte';
  import {api} from '$lib/scripts/api/api.config.js';
  import {createDebounce} from '$lib/scripts/util/utils.js';
  import ServerBidForm from "$lib/components/ServerBidForm.svelte";

  let {data} = $props();

  const mapServer = s => ({
    id: s.id,
    name: s.name,
    host: s.host,
    image: s.iconBase64,
    motd: s.motd,
    core: s.core,
    state: s.state,
    rating: s.rating
  });

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
  <Input placeholder="Поиск серверов..." bind:value={searchQuery}/>
</section>
<section class="server-bid-pane">
  <ServerBidForm/>
</section>
<section class="servers-pane">
  {#each servers as server}
    <ServerCard {server}/>
  {/each}
</section>

<style>
  .server-search {
    padding-top: var(--ui-spacing);
  }

  .servers-pane {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
    gap: var(--ui-spacing);
    width: 100%;
    padding-top: var(--ui-spacing);
  }
</style>
