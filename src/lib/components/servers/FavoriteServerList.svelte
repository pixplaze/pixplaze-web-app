<script>
  import ItemList from '#ui/lists/ItemList.svelte';
  import ItemListRow from '#ui/lists/ItemListRow.svelte';
  import Button from '#ui/buttons/Button.svelte';
  import ButtonIcon from '#ui/buttons/ButtonIcon.svelte';
  import Loader from '#ui/indicators/Loader.svelte';
  import {favoriteServers} from '#scripts/favoriteServers.svelte.js';
  import {activeServer} from '#scripts/activeServer.svelte.js';
  import {copyToClipboard} from '#util/dom.util.js';
  import ServerIcon from '#components/servers/ServerIcon.svelte';
  import Cancellable from "#ui/Cancellable.svelte";

  /** expanded — панель открыта: список перечитывается при каждом открытии, чтобы не устаревать. */
  const {expanded = false} = $props();

  /** id сервера, чей адрес только что скопирован: кнопка ненадолго показывает галочку. */
  let copiedId = $state(null);

  $effect(() => {
    if (expanded) favoriteServers.load();
  });

  const onCopy = async (server) => {
    await copyToClipboard(server.host);
    copiedId = server.id;
    setTimeout(() => copiedId = copiedId === server.id ? null : copiedId, 1500);
  };
</script>

{#if favoriteServers.servers.length > 0}
  <div class="favorite-server-list">
    <ItemList>
      {#each favoriteServers.servers as server (server.id)}
        <ItemListRow selected={activeServer.isActive(server.id)} onselect={() => activeServer.select(server)}>
          <ServerIcon src={server.image}/>
          <span class="server-name">{server.name}</span>
          {#snippet actions()}
            {#if favoriteServers.isPendingRemove(server.id)}
              <Cancellable time="5s">
                <Button classes="transparent undo-button" onclick={() => favoriteServers.undo(server.id)}>отменить</Button>
              </Cancellable>
            {:else}
              <ButtonIcon classes="transparent" icon="more"/>
              <ButtonIcon classes="transparent" icon={copiedId === server.id ? 'arrow-ok' : 'copy'} onclick={() => onCopy(server)}/>
              <ButtonIcon classes="transparent" icon="star-filled" onclick={() => favoriteServers.removeLater(server.id)}/>
            {/if}
          {/snippet}
        </ItemListRow>
      {/each}
    </ItemList>
  </div>
{:else if favoriteServers.loading}
  <Loader loading={true}/>
{:else if favoriteServers.error}
  <p class="favorite-servers-message">Не удалось загрузить избранное: {favoriteServers.error}</p>
{:else}
  <p class="favorite-servers-message">В избранном пока нет серверов</p>
{/if}

<style>
  .favorite-server-list {
    --item-list-background: var(--color-ui-secondary);
  }

  /* Активный сервер — строка постоянно «вдавлена», как кнопка списка при нажатии */
  .favorite-server-list :global(button[aria-current]) {
    background-color: var(--color-ui-shadow);
    box-shadow: inset 0 4px 0 0 var(--color-ui-shadow);
  }

  .favorite-server-list :global(.server-icon) {
    margin: 0 var(--ui-padding) 0 0;
  }

  .server-name {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    color: var(--color-text-secondary);
  }

  .favorite-servers-message {
    margin: 0;
    padding: var(--ui-padding);
    color: var(--color-text-secondary);
  }

  .favorite-server-list :global(.undo-button) {
    padding: 0 var(--ui-padding);
    width: calc(3 * var(--ui-size-block));
  }
</style>
