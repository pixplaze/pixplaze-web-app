<script>
  import ServerCard from '$lib/components/ServerCard.svelte';

  let {
    data
  } = $props();

  const servers = data.servers.map(s => ({
    id: s.id,
    name: s.name,
    host: s.host,
    image: s.iconBase64,
    motd: s.motd,
    core: s.core,
    state: s.state,
    rating: s.rating
  }))
</script>

<section class="servers-pane">
  {#each servers as server}
    <ServerCard {server}/>
  {/each}
</section>

<style>
  .servers-pane {
    box-sizing: border-box;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(350px, 100%), 1fr));
    gap: var(--ui-spacing);
    width: 100%;
  }
</style>