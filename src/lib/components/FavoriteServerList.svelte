<script>
  import ServerRow from "$lib/components/ServerRow.svelte";
  import Loader from "$lib/components/ui/Loader.svelte";
  import {serverFavoriteService} from "$lib/scripts/service/server.favorite.service.js";

  /** expanded — панель открыта: список перечитывается при каждом открытии, чтобы не устаревать. */
  const {expanded = false} = $props();

  let servers = $state([]);
  let loading = $state(false);
  let error = $state(null);

  async function load() {
    loading = true;
    error = null;
    try {
      servers = await serverFavoriteService.fetchMine();
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  $effect(() => {
    if (expanded) load();
  });
</script>

{#if loading}
  <Loader loading={true}/>
{:else if error}
  <p class="favorite-servers-message">Не удалось загрузить избранное: {error}</p>
{:else if servers.length === 0}
  <p class="favorite-servers-message">В избранном пока нет серверов</p>
{:else}
  {#each servers as server (server.id)}
    <!-- Без иконки ServerRow подставит заглушку: undefined, а не null, включает значение по умолчанию. -->
    <ServerRow name={server.name} thumbnail={server.image ?? undefined}/>
  {/each}
{/if}

<style>
  .favorite-servers-message {
    margin: 0;
    padding: var(--ui-padding);
    color: var(--color-text-secondary);
  }
</style>
