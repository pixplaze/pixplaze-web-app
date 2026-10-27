<script>
  import ServerCard from '$components/servers/ServerCard.svelte';
  import Input from '$ui/inputs/Input.svelte';
  import Loader from '$ui/indicators/Loader.svelte';
  import {ServerSearch} from '$components/servers/ServerList.svelte.js';
  import {auth} from '$scripts/auth.svelte.js';
  import {favorites} from '$scripts/favorites.svelte.js';

  /** servers — исходный листинг (SSR `load`), показывается при пустом поиске. */
  const {servers} = $props();

  // svelte-ignore state_referenced_locally
  const search = new ServerSearch(servers);
</script>

<section class="server-search">
  <h1>Поиск Minecraft серверов</h1>
  <Input id="servers-search" placeholder="Поиск серверов..." bind:value={search.query}/>
  <Loader loading={search.loading}/>
</section>
<section class="servers-pane">
  <h1>Список Minecraft серверов</h1>
  <div class="server-list">
    {#each search.servers as server (server.id)}
      <ServerCard {server}
                  favorite={auth.isAuthenticated ? favorites.has(server.id) : null}
                  onFavorite={(server) => favorites.has(server.id) ? favorites.remove(server.id) : favorites.add(server)}/>
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
</style>
